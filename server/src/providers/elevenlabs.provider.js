import axios from 'axios';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { DEFAULT_VOICE_SETTINGS, ELEVENLABS_MODELS } from '../utils/constants.js';

// Official ElevenLabs premade voices available on free and restricted-permission API keys
export const ELEVENLABS_DEFAULT_PREMADE_VOICES = [
  {
    id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'George',
    category: 'premade',
    gender: 'male',
    accent: 'British',
    age: 'middle aged',
    description: 'Warm, captivating British storyteller voice with rich resonance.',
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/e6206d1a-0721-4787-9286-ab1a17139739.mp3',
    labels: { gender: 'male', accent: 'british', age: 'middle aged', 'use case': 'narration' }
  },
  {
    id: 'Xb7hH8MSUJpSbSDYk0k2',
    name: 'Alice',
    category: 'premade',
    gender: 'female',
    accent: 'British',
    age: 'young',
    description: 'Clear, confident, articulate British female voice ideal for education and podcasts.',
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/Xb7hH8MSUJpSbSDYk0k2/d10f7534-11f6-4140-a01a-8101147b30c1.mp3',
    labels: { gender: 'female', accent: 'british', age: 'young', 'use case': 'education' }
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah',
    category: 'premade',
    gender: 'female',
    accent: 'American',
    age: 'young',
    description: 'Soft, cheerful conversational American female voice with expressive cadence.',
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e712-4fc2-4b03-b080-8a5e6721937a.mp3',
    labels: { gender: 'female', accent: 'american', age: 'young', 'use case': 'conversational' }
  },
  {
    id: 'CwhRBWXzGAHq8TQ4Fs17',
    name: 'Roger',
    category: 'premade',
    gender: 'male',
    accent: 'American',
    age: 'middle aged',
    description: 'Confident, casual, dynamic American male voice.',
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/CwhRBWXzGAHq8TQ4Fs17/51f0b112-2d64-4e0a-a828-5696d5966440.mp3',
    labels: { gender: 'male', accent: 'american', age: 'middle aged', 'use case': 'social media' }
  },
  {
    id: 'cgSgspJ2msm6clMCkdW9',
    name: 'Jessica',
    category: 'premade',
    gender: 'female',
    accent: 'American',
    age: 'young',
    description: 'Playful, bright, articulate young American female voice.',
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/56a97bf8-b69b-448f-846c-c31a1131de35.mp3',
    labels: { gender: 'female', accent: 'american', age: 'young', 'use case': 'conversational' }
  },
  {
    id: 'nPczCjzI2devNBz1zQrb',
    name: 'Brian',
    category: 'premade',
    gender: 'male',
    accent: 'American',
    age: 'middle aged',
    description: 'Deep, resonant, grounded American narrator with deep baritone warmth.',
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/nPczCjzI2devNBz1zQrb/2dd56214-7f9a-4127-9774-42614b50c0fc.mp3',
    labels: { gender: 'male', accent: 'american', age: 'middle aged', 'use case': 'narration' }
  },
  {
    id: 'FGY2WhTYpPnrIDTdsKH5',
    name: 'Laura',
    category: 'premade',
    gender: 'female',
    accent: 'American',
    age: 'young',
    description: 'Sunny, enthusiastic, friendly American female voice.',
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/FGY2WhTYpPnrIDTdsKH5/673417e4-5f77-4083-a5d3-00c701d44778.mp3',
    labels: { gender: 'female', accent: 'american', age: 'young', 'use case': 'commercial' }
  },
  {
    id: 'SAz9YHcvj6GT2YYXdXww',
    name: 'River',
    category: 'premade',
    gender: 'female',
    accent: 'American',
    age: 'middle aged',
    description: 'Calm, natural, meditative, thoughtful female speaker.',
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/SAz9YHcvj6GT2YYXdXww/e5bba0f9-509a-4841-b3b0-46d8400fa1b7.mp3',
    labels: { gender: 'female', accent: 'american', age: 'middle aged', 'use case': 'meditation' }
  },
  {
    id: 'TX3LPaxmHKxFdv7VOQHJ',
    name: 'Liam',
    category: 'premade',
    gender: 'male',
    accent: 'American',
    age: 'young',
    description: 'Warm, youthful, energetic American male voice.',
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/63148076-6363-42db-a970-d08ab3d31074.mp3',
    labels: { gender: 'male', accent: 'american', age: 'young', 'use case': 'characters' }
  },
  {
    id: 'bIHbv24MWmeRgasZH58o',
    name: 'Will',
    category: 'premade',
    gender: 'male',
    accent: 'American',
    age: 'young',
    description: 'Relaxed, friendly, everyday conversational voice.',
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/bIHbv24MWmeRgasZH58o/8e21c2d3-1791-4e69-ac72-9701d723a676.mp3',
    labels: { gender: 'male', accent: 'american', age: 'young', 'use case': 'audiobook' }
  },
  {
    id: 'iP95p4xoKVk53GoZ742B',
    name: 'Chris',
    category: 'premade',
    gender: 'male',
    accent: 'American',
    age: 'middle aged',
    description: 'Charming, casual, approachable American male voice.',
    previewUrl: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/iP95p4xoKVk53GoZ742B/3f4bde52-e325-4523-8631-01f2e1a3bc86.mp3',
    labels: { gender: 'male', accent: 'american', age: 'middle aged', 'use case': 'conversational' }
  }
];

class ElevenLabsProvider {
  constructor() {
    this.name = 'ElevenLabs';
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.cachedVoices = null;
    this.lastVoicesFetch = 0;
    this.cacheTtlMs = 60 * 60 * 1000; // 1 hour cache
  }

  getHeaders() {
    if (!config.isConfigured('elevenlabs')) {
      const err = new Error('ELEVENLABS_API_KEY is not configured or is using placeholder in server/.env');
      err.code = 'CONFIG_REQUIRED';
      err.provider = 'elevenlabs';
      throw err;
    }
    return {
      'xi-api-key': config.ai.elevenlabsApiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Fetches actual voices from ElevenLabs API
   */
  async getVoices(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && this.cachedVoices && (now - this.lastVoicesFetch < this.cacheTtlMs)) {
      return this.cachedVoices;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      const rawVoices = response.data.voices || [];
      const parsedVoices = rawVoices.map(v => {
        const labels = v.labels || {};
        const gender = labels.gender ? labels.gender.toLowerCase() : (labels['accent-gender']?.includes('female') ? 'female' : labels['accent-gender']?.includes('male') ? 'male' : 'unspecified');
        const accent = labels.accent || labels['accent'] || '';
        const age = labels.age || '';
        const description = labels.description || labels['use case'] || v.description || '';
        
        return {
          id: v.voice_id,
          name: v.name,
          category: v.category || 'premade',
          gender,
          accent,
          age,
          description,
          previewUrl: v.preview_url || null,
          labels,
          highQualityBaseModelIds: v.high_quality_base_model_ids || [],
          samples: (v.samples || []).map(s => ({
            sampleId: s.sample_id,
            fileName: s.file_name,
            mimeType: s.mime_type
          }))
        };
      });

      this.cachedVoices = parsedVoices;
      this.lastVoicesFetch = now;
      logger.info(`Fetched ${parsedVoices.length} voices from ElevenLabs API`);
      return parsedVoices;
    } catch (err) {
      if (err.code === 'CONFIG_REQUIRED') {
        throw err;
      }

      const errMsg = err.response?.data?.detail?.message || err.message;
      logger.warn(`ElevenLabs /v1/voices notice: ${errMsg}. Using official premade catalog.`);

      // If key is missing voices_read permission or subscription tier doesn't support custom voice listing
      if (errMsg.includes('voices_read') || errMsg.includes('permission') || err.response?.status === 401 || err.response?.status === 403) {
        this.cachedVoices = ELEVENLABS_DEFAULT_PREMADE_VOICES;
        this.lastVoicesFetch = now;
        return ELEVENLABS_DEFAULT_PREMADE_VOICES;
      }

      const customErr = new Error(errMsg || 'ElevenLabs API error');
      customErr.status = err.response?.status || 500;
      customErr.code = err.response?.status === 401 ? 'INVALID_API_KEY' : 'PROVIDER_ERROR';
      throw customErr;
    }
  }

  /**
   * Generates speech from text
   */
  async generateSpeech({ text, voiceId, modelId = 'eleven_multilingual_v2', voiceSettings = {} }) {
    if (!text || !text.trim()) {
      const err = new Error('Text cannot be empty');
      err.status = 400;
      throw err;
    }

    if (!voiceId) {
      const err = new Error('Voice ID is required');
      err.status = 400;
      throw err;
    }

    // Merge settings
    const settings = {
      stability: typeof voiceSettings.stability === 'number' ? voiceSettings.stability : DEFAULT_VOICE_SETTINGS.stability,
      similarity_boost: typeof voiceSettings.similarity === 'number' ? voiceSettings.similarity : DEFAULT_VOICE_SETTINGS.similarity_boost,
    };

    if (modelId.includes('v2')) {
      if (typeof voiceSettings.style === 'number') {
        settings.style = voiceSettings.style;
      }
      if (typeof voiceSettings.speakerBoost === 'boolean') {
        settings.use_speaker_boost = voiceSettings.speakerBoost;
      }
    }

    try {
      logger.info(`Generating speech with voice ${voiceId}, model ${modelId}, length: ${text.length} chars`);
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: modelId,
          voice_settings: settings
        },
        {
          headers: this.getHeaders(),
          params: {
            output_format: 'mp3_44100_128'
          },
          responseType: 'arraybuffer',
          timeout: 45000
        }
      );

      return {
        audioBuffer: Buffer.from(response.data),
        mimeType: 'audio/mpeg',
        format: 'mp3',
        modelId,
        voiceId
      };
    } catch (err) {
      if (err.code === 'CONFIG_REQUIRED') {
        throw err;
      }

      let errorMsg = err.message;
      if (err.response?.data && Buffer.isBuffer(err.response.data)) {
        try {
          const parsed = JSON.parse(err.response.data.toString('utf-8'));
          errorMsg = parsed.detail?.message || parsed.message || errorMsg;
        } catch (_) {}
      } else if (err.response?.data?.detail?.message) {
        errorMsg = err.response.data.detail.message;
      }

      logger.error('ElevenLabs speech generation error:', errorMsg);
      const customErr = new Error(errorMsg);
      customErr.status = err.response?.status || 500;
      customErr.code = err.response?.status === 401 ? 'INVALID_API_KEY' : err.response?.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'TTS_GENERATION_FAILED';
      throw customErr;
    }
  }
}

export const elevenLabsProvider = new ElevenLabsProvider();
