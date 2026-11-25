import path from 'path';
import fs from 'fs';
import { openAIProvider } from '../providers/openai.provider.js';
import { elevenLabsProvider } from '../providers/elevenlabs.provider.js';
import { audioService } from '../services/audio.service.js';
import { storageService } from '../services/storage.service.js';
import { usageService } from '../services/usage.service.js';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export const transcribeAudio = async (req, res, next) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_FILE_UPLOADED', message: 'No audio file was uploaded' }
    });
  }

  const userId = req.user?.id;
  const tempFilesToClean = [file.path];

  try {
    let processedFilePath = file.path;

    // Check if format conversion to MP3 is needed
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.mp3') {
      const convertedPath = `${file.path}_converted.mp3`;
      await audioService.convertToStandardMp3(file.path, convertedPath);
      processedFilePath = convertedPath;
      tempFilesToClean.push(convertedPath);
    }

    // Probing duration
    const metadata = await audioService.getAudioMetadata(processedFilePath);
    const durationSeconds = metadata.duration || 0;

    // Split audio if larger than 120s to ensure reliable segmenting
    let transcriptionText = '';
    let detectedLanguage = 'en';

    if (durationSeconds > 120) {
      const segments = await audioService.splitAudio(processedFilePath, 120);
      segments.forEach(s => { if (s !== processedFilePath) tempFilesToClean.push(s); });

      const texts = [];
      for (const segPath of segments) {
        const segRes = await openAIProvider.transcribeAudio(segPath, {
          language: req.body.language || null
        });
        texts.push(segRes.text);
        if (segRes.language) detectedLanguage = segRes.language;
      }
      transcriptionText = texts.join(' ');
    } else {
      const transcription = await openAIProvider.transcribeAudio(processedFilePath, {
        language: req.body.language || null
      });
      transcriptionText = transcription.text;
      detectedLanguage = transcription.language;
    }

    // Save source audio to storage
    const storageResult = await storageService.saveAudio({
      filePath: processedFilePath,
      fileName: file.originalname,
      mimeType: 'audio/mpeg',
      userId
    });

    // Track usage
    await usageService.trackUsage({
      userId,
      operationType: 'transcription_seconds',
      quantity: durationSeconds,
      provider: 'openai',
      meta: { durationSeconds, detectedLanguage }
    });

    res.json({
      success: true,
      transcript: transcriptionText,
      detectedLanguage,
      durationSeconds: parseFloat(durationSeconds.toFixed(2)),
      sourceAudioUrl: storageResult.publicUrl,
      sourceAudioFileId: storageResult.fileId
    });
  } catch (err) {
    next(err);
  } finally {
    audioService.cleanupFiles(...tempFilesToClean);
  }
};

export const translateText = async (req, res, next) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;
    const userId = req.user?.id;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Text to translate is required' }
      });
    }

    if (!targetLanguage) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Target language is required' }
      });
    }

    const translationResult = await openAIProvider.translateText({
      text,
      targetLanguage,
      sourceLanguage: sourceLanguage || 'auto'
    });

    // Track translation usage
    await usageService.trackUsage({
      userId,
      operationType: 'translation_chars',
      quantity: text.length,
      provider: 'openai',
      meta: { targetLanguage, sourceLanguage }
    });

    res.json({
      success: true,
      translatedText: translationResult.translatedText,
      targetLanguage: translationResult.targetLanguage,
      sourceLanguage: translationResult.sourceLanguage
    });
  } catch (err) {
    next(err);
  }
};

export const createTranslationProject = async (req, res, next) => {
  try {
    const {
      projectId,
      sourceAudioUrl,
      sourceAudioFileId,
      detectedLanguage,
      sourceTranscript,
      targetLanguage,
      translatedTranscript,
      voiceId,
      voiceName,
      modelId,
      voiceSettings
    } = req.body;
    const userId = req.user?.id;

    if (!translatedTranscript || !translatedTranscript.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Translated text cannot be empty' }
      });
    }

    if (!voiceId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Output voice must be selected' }
      });
    }

    // Step 7: Generate speech for translated transcript via ElevenLabs
    const ttsResult = await elevenLabsProvider.generateSpeech({
      text: translatedTranscript,
      voiceId,
      modelId: modelId || 'eleven_multilingual_v2',
      voiceSettings: voiceSettings || {}
    });

    // Step 8: Save resulting audio
    const storageResult = await storageService.saveAudio({
      buffer: ttsResult.audioBuffer,
      fileName: `translated_${Date.now()}.mp3`,
      mimeType: ttsResult.mimeType,
      userId
    });

    // Track usage
    await usageService.trackUsage({
      userId,
      operationType: 'tts_chars',
      quantity: translatedTranscript.length,
      provider: 'elevenlabs',
      meta: { voiceId, type: 'speech_translation' }
    });

    let generationRecord = null;
    let translationRecord = null;

    if (supabaseAdmin && userId) {
      try {
        // Save generation
        const { data: genData } = await supabaseAdmin
          .from('generations')
          .insert({
            user_id: userId,
            project_id: projectId || null,
            generation_type: 'translation',
            input_text: translatedTranscript,
            input_language: detectedLanguage,
            output_language: targetLanguage,
            voice_id: voiceId,
            voice_name: voiceName || voiceId,
            voice_settings: voiceSettings || {},
            audio_file_id: storageResult.fileId,
            audio_url: storageResult.publicUrl,
            duration_seconds: storageResult.durationSeconds,
            characters_count: translatedTranscript.length,
            status: 'completed'
          })
          .select()
          .single();

        generationRecord = genData;

        // Save translation project
        const { data: transData } = await supabaseAdmin
          .from('translations')
          .insert({
            user_id: userId,
            project_id: projectId || null,
            source_audio_file_id: sourceAudioFileId || null,
            source_audio_url: sourceAudioUrl || null,
            detected_language: detectedLanguage,
            source_transcript: sourceTranscript,
            target_language: targetLanguage,
            translated_transcript: translatedTranscript,
            final_speech_generation_id: generationRecord?.id || null,
            status: 'completed'
          })
          .select()
          .single();

        translationRecord = transData;
      } catch (dbErr) {
        logger.warn(`Could not save translation to DB: ${dbErr.message}`);
      }
    }

    res.status(201).json({
      success: true,
      project: {
        id: translationRecord?.id || storageResult.fileId,
        sourceAudioUrl,
        detectedLanguage,
        sourceTranscript,
        targetLanguage,
        translatedTranscript,
        outputAudioUrl: storageResult.publicUrl,
        durationSeconds: storageResult.durationSeconds,
        voiceId,
        voiceName,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getTranslationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!supabaseAdmin) {
      return res.json({ success: true, translation: null });
    }

    const { data, error } = await supabaseAdmin
      .from('translations')
      .select('*, final_generation:final_speech_generation_id(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Translation project not found' }
      });
    }

    res.json({ success: true, translation: data });
  } catch (err) {
    next(err);
  }
};

