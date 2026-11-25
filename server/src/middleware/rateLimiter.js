import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 generations per minute per IP
  message: {
    success: false,
    error: {
      code: 'GENERATION_RATE_LIMIT',
      message: 'Generation rate limit reached. Please wait a moment before starting another generation.'
    }
  }
});

