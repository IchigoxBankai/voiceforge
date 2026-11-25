import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { audioService } from './audio.service.js';

// Ensure local directories exist
if (!fs.existsSync(config.storage.tempDir)) {
  fs.mkdirSync(config.storage.tempDir, { recursive: true });
}
if (!fs.existsSync(config.storage.uploadsDir)) {
  fs.mkdirSync(config.storage.uploadsDir, { recursive: true });
}

export const storageService = {
  /**
   * Saves an audio buffer or file to Supabase Storage or local fallback
   * Returns: { fileId, publicUrl, storagePath, sizeBytes, durationSeconds }
   */
  async saveAudio({ buffer, filePath, fileName, mimeType = 'audio/mpeg', userId = null }) {
    const fileId = uuidv4();
    const ext = path.extname(fileName || 'audio.mp3') || '.mp3';
    const cleanFileName = `${fileId}${ext}`;
    
    let fileBuffer = buffer;
    if (!fileBuffer && filePath && fs.existsSync(filePath)) {
      fileBuffer = fs.readFileSync(filePath);
    }
    if (!fileBuffer) {
      throw new Error('No audio data provided to storage service');
    }

    const sizeBytes = fileBuffer.length;
    let durationSeconds = 0;

    // Detect duration using temp file if needed
    const tempTestPath = path.join(config.storage.tempDir, `probe_${cleanFileName}`);
    try {
      fs.writeFileSync(tempTestPath, fileBuffer);
      const meta = await audioService.getAudioMetadata(tempTestPath);
      durationSeconds = meta.duration || 0;
    } catch (e) {
      logger.warn(`Could not probe audio duration for ${cleanFileName}: ${e.message}`);
    } finally {
      audioService.cleanupFiles(tempTestPath);
    }

    let publicUrl = '';
    const storagePath = userId ? `${userId}/${cleanFileName}` : `public/${cleanFileName}`;

    // Attempt Supabase Storage if configured
    let uploadedToSupabase = false;
    if (config.isConfigured('supabase') && supabaseAdmin) {
      try {
        const { error: uploadErr } = await supabaseAdmin.storage
          .from(config.storage.bucketName)
          .upload(storagePath, fileBuffer, {
            contentType: mimeType,
            upsert: true
          });

        if (!uploadErr) {
          const { data: urlData } = supabaseAdmin.storage
            .from(config.storage.bucketName)
            .getPublicUrl(storagePath);
          publicUrl = urlData.publicUrl;
          uploadedToSupabase = true;
          logger.info(`Successfully stored audio in Supabase Storage: ${storagePath}`);
        } else {
          logger.warn(`Supabase Storage upload warning: ${uploadErr.message}. Falling back to local storage.`);
        }
      } catch (err) {
        logger.warn(`Supabase storage exception: ${err.message}. Using local fallback.`);
      }
    }

    // Local fallback if Supabase not configured or failed
    if (!uploadedToSupabase) {
      const localFilePath = path.join(config.storage.uploadsDir, cleanFileName);
      fs.writeFileSync(localFilePath, fileBuffer);
      publicUrl = `/uploads/${cleanFileName}`;
      logger.info(`Stored audio locally: ${localFilePath} (URL: ${publicUrl})`);
    }

    // Save metadata record to database if userId and supabaseAdmin are available
    let audioRecordId = null;
    if (supabaseAdmin && userId) {
      try {
        const { data: dbRecord, error: dbErr } = await supabaseAdmin
          .from('audio_files')
          .insert({
            id: fileId,
            user_id: userId,
            storage_path: storagePath,
            file_name: fileName || cleanFileName,
            mime_type: mimeType,
            size_bytes: sizeBytes,
            duration_seconds: durationSeconds,
            format: ext.replace('.', '')
          })
          .select()
          .single();

        if (!dbErr && dbRecord) {
          audioRecordId = dbRecord.id;
        }
      } catch (dbErr) {
        logger.warn(`Could not save audio_files table entry: ${dbErr.message}`);
      }
    }

    return {
      fileId: audioRecordId || fileId,
      publicUrl,
      storagePath,
      sizeBytes,
      durationSeconds: parseFloat(durationSeconds.toFixed(2)),
      fileName: cleanFileName
    };
  }
};

