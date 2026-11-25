import { elevenLabsProvider } from '../providers/elevenlabs.provider.js';
import { storageService } from '../services/storage.service.js';
import { usageService } from '../services/usage.service.js';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export const generateSpeech = async (req, res, next) => {
  try {
    const { text, voiceId, voiceName, modelId, voiceSettings, projectId, language } = req.body;
    const userId = req.user?.id;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Text input cannot be empty' }
      });
    }

    if (!voiceId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Voice selection is required' }
      });
    }

    // 1. Generate speech via ElevenLabs API
    const generationResult = await elevenLabsProvider.generateSpeech({
      text,
      voiceId,
      modelId: modelId || 'eleven_multilingual_v2',
      voiceSettings: voiceSettings || {}
    });

    // 2. Save audio into Supabase Storage or local fallback
    const storageResult = await storageService.saveAudio({
      buffer: generationResult.audioBuffer,
      fileName: `tts_${Date.now()}.mp3`,
      mimeType: generationResult.mimeType,
      userId: req.user?.isGuest ? null : userId
    });

    // 3. Track usage (characters count)
    await usageService.trackUsage({
      userId,
      operationType: 'tts_chars',
      quantity: text.length,
      provider: 'elevenlabs',
      meta: { voiceId, modelId, durationSeconds: storageResult.durationSeconds }
    });

    // 4. Save record to Supabase generations table if registered user and DB connected
    let generationRecord = null;
    if (supabaseAdmin && userId && !req.user?.isGuest) {
      try {
        const { data, error } = await supabaseAdmin
          .from('generations')
          .insert({
            user_id: userId,
            project_id: projectId || null,
            generation_type: 'tts',
            input_text: text,
            input_language: language || 'en',
            output_language: language || 'en',
            voice_id: voiceId,
            voice_name: voiceName || voiceId,
            voice_settings: voiceSettings || {},
            audio_file_id: storageResult.fileId,
            audio_url: storageResult.publicUrl,
            duration_seconds: storageResult.durationSeconds,
            characters_count: text.length,
            status: 'completed'
          })
          .select()
          .single();

        if (!error && data) {
          generationRecord = data;
        }
      } catch (dbErr) {
        logger.warn(`Failed to insert generation record into DB: ${dbErr.message}`);
      }
    }

    res.status(201).json({
      success: true,
      generation: generationRecord || {
        id: storageResult.fileId,
        audio_url: storageResult.publicUrl,
        duration_seconds: storageResult.durationSeconds,
        characters_count: text.length,
        voice_id: voiceId,
        voice_name: voiceName,
        input_text: text,
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};
