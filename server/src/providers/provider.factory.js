import { config } from '../config/env.js';
import { elevenLabsProvider } from './elevenlabs.provider.js';
import { openAIProvider } from './openai.provider.js';

export class ProviderFactory {
  /**
   * Returns TTS provider instance
   */
  static getTTSProvider(providerName = 'elevenlabs') {
    switch (providerName.toLowerCase()) {
      case 'elevenlabs':
        return elevenLabsProvider;
      default:
        throw new Error(`Unsupported TTS provider: ${providerName}`);
    }
  }

  /**
   * Returns Transcription provider instance
   */
  static getTranscriptionProvider(providerName = 'openai') {
    switch (providerName.toLowerCase()) {
      case 'openai':
        return openAIProvider;
      default:
        throw new Error(`Unsupported transcription provider: ${providerName}`);
    }
  }

  /**
   * Returns Translation provider instance
   */
  static getTranslationProvider(providerName = 'openai') {
    switch (providerName.toLowerCase()) {
      case 'openai':
        return openAIProvider;
      default:
        throw new Error(`Unsupported translation provider: ${providerName}`);
    }
  }

  /**
   * Returns health and configuration status for all integrations
   */
  static getProviderStatus() {
    return {
      elevenlabs: {
        name: 'ElevenLabs',
        capability: 'Text-to-Speech',
        configured: config.isConfigured('elevenlabs'),
        models: ['eleven_multilingual_v2', 'eleven_turbo_v2_5', 'eleven_flash_v2_5', 'eleven_monolingual_v1']
      },
      openai: {
        name: 'OpenAI',
        capability: 'Transcription (Whisper) & Translation (GPT-4o-mini)',
        configured: config.isConfigured('openai'),
        models: ['whisper-1', 'gpt-4o-mini']
      },
      supabase: {
        name: 'Supabase',
        capability: 'Database, Auth & Audio Storage',
        configured: config.isConfigured('supabase')
      }
    };
  }
}

