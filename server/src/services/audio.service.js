import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

export const audioService = {
  /**
   * Probes audio file and returns duration, format, channels, bitrate
   */
  getAudioMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          logger.error('Failed to probe audio metadata:', err.message);
          return reject(new Error(`Audio metadata probe failed: ${err.message}`));
        }
        const format = metadata.format || {};
        const audioStream = (metadata.streams || []).find(s => s.codec_type === 'audio') || {};
        
        resolve({
          duration: parseFloat(format.duration) || 0,
          formatName: format.format_name,
          bitRate: parseInt(format.bit_rate, 10) || 0,
          size: parseInt(format.size, 10) || 0,
          sampleRate: parseInt(audioStream.sample_rate, 10) || 44100,
          channels: audioStream.channels || 2,
          codec: audioStream.codec_name
        });
      });
    });
  },

  /**
   * Converts any supported audio format to a standardized 44.1kHz MP3
   */
  convertToStandardMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3')
        .audioCodec('libmp3lame')
        .audioFrequency(44100)
        .audioChannels(2)
        .audioBitrate('192k')
        .on('end', () => resolve(outputPath))
        .on('error', (err) => {
          logger.error('FFmpeg MP3 conversion failed:', err.message);
          reject(new Error(`Audio conversion failed: ${err.message}`));
        })
        .save(outputPath);
    });
  },

  /**
   * Splits audio into segments of maxSegmentSeconds (e.g. 120s for long transcriptions)
   */
  splitAudio(filePath, maxSegmentSeconds = 120, outputDir = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const metadata = await this.getAudioMetadata(filePath);
        const totalDuration = metadata.duration;

        // If audio is shorter than max segment, no splitting needed
        if (totalDuration <= maxSegmentSeconds) {
          return resolve([filePath]);
        }

        const targetDir = outputDir || path.dirname(filePath);
        const ext = path.extname(filePath);
        const baseName = path.basename(filePath, ext);
        const segmentCount = Math.ceil(totalDuration / maxSegmentSeconds);
        const segmentPaths = [];

        logger.info(`Splitting audio of ${totalDuration.toFixed(1)}s into ${segmentCount} segments`);

        for (let i = 0; i < segmentCount; i++) {
          const startTime = i * maxSegmentSeconds;
          const duration = Math.min(maxSegmentSeconds, totalDuration - startTime);
          const segmentPath = path.join(targetDir, `${baseName}_part_${i + 1}${ext}`);

          await new Promise((segResolve, segReject) => {
            ffmpeg(filePath)
              .setStartTime(startTime)
              .setDuration(duration)
              .output(segmentPath)
              .on('end', () => {
                segmentPaths.push(segmentPath);
                segResolve();
              })
              .on('error', (err) => segReject(err))
              .run();
          });
        }

        resolve(segmentPaths);
      } catch (err) {
        reject(err);
      }
    });
  },

  /**
   * Concatenates an array of audio file paths into one output file
   */
  concatenateAudio(filePaths, outputPath) {
    return new Promise((resolve, reject) => {
      if (!filePaths || filePaths.length === 0) {
        return reject(new Error('No files provided for concatenation'));
      }
      if (filePaths.length === 1) {
        fs.copyFileSync(filePaths[0], outputPath);
        return resolve(outputPath);
      }

      const command = ffmpeg();
      filePaths.forEach(fp => command.input(fp));

      command
        .on('end', () => resolve(outputPath))
        .on('error', (err) => {
          logger.error('Audio concatenation failed:', err.message);
          reject(new Error(`Audio concatenation failed: ${err.message}`));
        })
        .mergeToFile(outputPath, path.dirname(outputPath));
    });
  },

  /**
   * Safely deletes temporary files
   */
  cleanupFiles(...filePaths) {
    filePaths.forEach(fp => {
      try {
        if (fp && fs.existsSync(fp)) {
          fs.unlinkSync(fp);
        }
      } catch (err) {
        logger.warn(`Could not delete temp file ${fp}: ${err.message}`);
      }
    });
  }
};

