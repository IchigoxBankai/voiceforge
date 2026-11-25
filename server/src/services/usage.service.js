import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

// In-memory fallback usage accumulator when Supabase is not connected
const inMemoryUsage = new Map();

export const usageService = {
  /**
   * Tracks an operation:
   * operationType: 'tts_chars' | 'transcription_seconds' | 'translation_chars' | 'tts_generation'
   */
  async trackUsage({ userId, operationType, quantity, provider, meta = {} }) {
    if (!userId) return;

    // Track in memory
    const userStats = inMemoryUsage.get(userId) || {
      ttsCharacters: 0,
      audioSecondsProcessed: 0,
      translationCharacters: 0,
      totalGenerations: 0,
      totalRequests: 0
    };

    userStats.totalRequests += 1;
    if (operationType === 'tts_chars') {
      userStats.ttsCharacters += Number(quantity);
      userStats.totalGenerations += 1;
    } else if (operationType === 'transcription_seconds') {
      userStats.audioSecondsProcessed += Number(quantity);
    } else if (operationType === 'translation_chars') {
      userStats.translationCharacters += Number(quantity);
    } else if (operationType === 'tts_generation') {
      userStats.totalGenerations += 1;
    }
    inMemoryUsage.set(userId, userStats);

    // Save to database if available
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('usage_records').insert({
          user_id: userId,
          operation_type: operationType,
          quantity: Number(quantity),
          provider: provider || 'unknown',
          meta
        });
      } catch (err) {
        logger.warn(`Failed to insert usage record into DB: ${err.message}`);
      }
    }
  },

  /**
   * Retrieves summary usage statistics for a user
   */
  async getUserUsage(userId) {
    if (!userId) {
      return {
        ttsCharacters: 0,
        audioMinutesProcessed: 0,
        translationCharacters: 0,
        totalGenerations: 0,
        totalTranslations: 0,
        limits: {
          maxTtsCharacters: 50000,
          maxAudioMinutes: 60,
          tier: 'Free Tier'
        }
      };
    }

    let stats = {
      ttsCharacters: 0,
      audioSecondsProcessed: 0,
      translationCharacters: 0,
      totalGenerations: 0,
      totalTranslations: 0
    };

    if (supabaseAdmin) {
      try {
        const { data: records, error } = await supabaseAdmin
          .from('usage_records')
          .select('operation_type, quantity')
          .eq('user_id', userId);

        if (!error && records) {
          records.forEach(r => {
            const q = Number(r.quantity) || 0;
            if (r.operation_type === 'tts_chars') stats.ttsCharacters += q;
            if (r.operation_type === 'transcription_seconds') stats.audioSecondsProcessed += q;
            if (r.operation_type === 'translation_chars') stats.translationCharacters += q;
            if (r.operation_type === 'tts_generation') stats.totalGenerations += 1;
          });
        }
      } catch (err) {
        logger.warn(`Could not query usage records: ${err.message}`);
      }

      // Count total generations & translations directly
      try {
        const [{ count: genCount }, { count: transCount }] = await Promise.all([
          supabaseAdmin.from('generations').select('*', { count: 'exact', head: true }).eq('user_id', userId),
          supabaseAdmin.from('translations').select('*', { count: 'exact', head: true }).eq('user_id', userId)
        ]);
        if (genCount !== null) stats.totalGenerations = genCount;
        if (transCount !== null) stats.totalTranslations = transCount;
      } catch (e) {
        // use accumulators
      }
    } else {
      const mem = inMemoryUsage.get(userId);
      if (mem) stats = { ...stats, ...mem };
    }

    return {
      ttsCharacters: stats.ttsCharacters,
      audioMinutesProcessed: parseFloat((stats.audioSecondsProcessed / 60).toFixed(1)),
      translationCharacters: stats.translationCharacters,
      totalGenerations: stats.totalGenerations,
      totalTranslations: stats.totalTranslations,
      limits: {
        maxTtsCharacters: 50000,
        maxAudioMinutes: 60,
        tier: 'Developer Free'
      }
    };
  }
};

