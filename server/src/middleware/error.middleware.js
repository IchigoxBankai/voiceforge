import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || 'SERVER_ERROR';

  logger.error(`[API Error] [${req.method} ${req.originalUrl}] [${status}]`, err.message);

  if (err.code === 'CONFIG_REQUIRED' || err.code === 'INVALID_API_KEY') {
    const isEleven = req.originalUrl.includes('voices') || req.originalUrl.includes('speech');
    const providerName = err.provider || (isEleven ? 'elevenlabs' : 'openai');
    return res.status(err.code === 'INVALID_API_KEY' ? 401 : 503).json({
      success: false,
      error: {
        code: err.code,
        provider: providerName,
        message: err.message,
        details: `Please set a valid ${providerName === 'elevenlabs' ? 'ELEVENLABS_API_KEY' : 'OPENAI_API_KEY'} in server/.env.`
      }
    });
  }

  // Don't leak raw stack traces or internal secrets to frontend
  res.status(status).json({
    success: false,
    error: {
      code,
      message: err.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && { details: err.details || undefined })
    }
  });
};

