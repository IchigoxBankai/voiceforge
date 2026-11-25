import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

class OpenAIProvider {
  constructor() {
    this.name = 'OpenAI';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  getHeaders() {
    if (!config.isConfigured('openai')) {
      const err = new Error('OPENAI_API_KEY is not configured or is using placeholder in server/.env');
      err.code = 'CONFIG_REQUIRED';
      err.provider = 'openai';
      throw err;
    }
    return {
      'Authorization': `Bearer ${config.ai.openaiApiKey}`
    };
  }

  /**
   * Transcribes speech from an audio file using Whisper-1
   * Endpoint: POST https://api.openai.com/v1/audio/transcriptions
   */
  async transcribeAudio(audioFilePath, { language = null, prompt = '' } = {}) {
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found at path: ${audioFilePath}`);
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(audioFilePath));
    form.append('model', 'whisper-1');
    form.append('response_format', 'verbose_json');

    if (language && language !== 'auto') {
      form.append('language', language);
    }
    if (prompt) {
      form.append('prompt', prompt);
    }

    try {
      logger.info(`Transcribing audio file: ${audioFilePath} using Whisper-1`);
      const response = await axios.post(`${this.baseUrl}/audio/transcriptions`, form, {
        headers: {
          ...this.getHeaders(),
          ...form.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 90000
      });

      const data = response.data;
      return {
        text: data.text?.trim() || '',
        language: data.language || 'unknown',
        duration: data.duration || 0,
        segments: (data.segments || []).map(s => ({
          id: s.id,
          start: s.start,
          end: s.end,
          text: s.text
        }))
      };
    } catch (err) {
      if (err.code === 'CONFIG_REQUIRED') {
        throw err;
      }
      const errMsg = err.response?.data?.error?.message || err.message;
      logger.error('OpenAI Whisper transcription error:', errMsg);
      const customErr = new Error(errMsg);
      customErr.status = err.response?.status || 500;
      customErr.code = err.response?.status === 401 ? 'INVALID_API_KEY' : err.response?.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'TRANSCRIPTION_FAILED';
      throw customErr;
    }
  }

  /**
   * Translates text into target language using current OpenAI GPT-4o-mini
   * Endpoint: POST https://api.openai.com/v1/chat/completions
   */
  async translateText({ text, targetLanguage, sourceLanguage = 'auto' }) {
    if (!text || !text.trim()) {
      throw new Error('Text to translate cannot be empty');
    }
    if (!targetLanguage) {
      throw new Error('Target language is required');
    }

    const systemPrompt = `You are a professional linguistic translator specializing in natural, fluent spoken dialogue.
Your task is to translate the user text into ${targetLanguage}.
Guidelines:
1. Maintain the natural speaking tone, nuances, and register (formal or informal) of the speaker.
2. Preserve paragraph structure, line breaks, and punctuation.
3. Translate accurately without summarizing or removing information.
4. Output ONLY the translated text. Do not include translator notes, explanations, or quotes around the output.`;

    const userPrompt = sourceLanguage && sourceLanguage !== 'auto'
      ? `Translate the following speech transcript from ${sourceLanguage} to ${targetLanguage}:\n\n${text}`
      : `Translate the following speech transcript to ${targetLanguage}:\n\n${text}`;

    try {
      logger.info(`Translating text (${text.length} chars) to ${targetLanguage} using GPT-4o-mini`);
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3
        },
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json'
          },
          timeout: 45000
        }
      );

      const translatedText = response.data.choices?.[0]?.message?.content?.trim() || '';
      return {
        translatedText,
        sourceLanguage,
        targetLanguage,
        model: 'gpt-4o-mini',
        usage: response.data.usage || {}
      };
    } catch (err) {
      if (err.code === 'CONFIG_REQUIRED') {
        throw err;
      }
      const errMsg = err.response?.data?.error?.message || err.message;
      logger.error('OpenAI translation error:', errMsg);
      const customErr = new Error(errMsg);
      customErr.status = err.response?.status || 500;
      customErr.code = err.response?.status === 401 ? 'INVALID_API_KEY' : err.response?.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'TRANSLATION_FAILED';
      throw customErr;
    }
  }
}

export const openAIProvider = new OpenAIProvider();

