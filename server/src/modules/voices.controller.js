import { ProviderFactory } from '../providers/provider.factory.js';
import { elevenLabsProvider } from '../providers/elevenlabs.provider.js';
import { SUPPORTED_LANGUAGES, ELEVENLABS_MODELS } from '../utils/constants.js';

export const getVoices = async (req, res, next) => {
  try {
    const { refresh, gender, search, language, accent } = req.query;
    const voices = await elevenLabsProvider.getVoices(refresh === 'true');

    let filtered = [...voices];

    // Filter by gender using actual provider metadata
    if (gender && gender !== 'all') {
      const gLower = gender.toLowerCase();
      filtered = filtered.filter(v => v.gender === gLower);
    }

    // Filter by search term
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(q) || 
        v.description.toLowerCase().includes(q) ||
        (v.accent && v.accent.toLowerCase().includes(q))
      );
    }

    // Filter by accent
    if (accent && accent !== 'all') {
      filtered = filtered.filter(v => v.accent && v.accent.toLowerCase() === accent.toLowerCase());
    }

    res.json({
      success: true,
      voices: filtered,
      total: filtered.length,
      unfilteredTotal: voices.length
    });
  } catch (err) {
    next(err);
  }
};

export const getLanguages = (req, res) => {
  res.json({
    success: true,
    languages: SUPPORTED_LANGUAGES,
    models: ELEVENLABS_MODELS
  });
};

export const getSystemStatus = (req, res) => {
  res.json({
    success: true,
    status: ProviderFactory.getProviderStatus(),
    timestamp: new Date().toISOString()
  });
};

