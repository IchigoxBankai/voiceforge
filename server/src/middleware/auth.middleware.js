import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Missing or invalid Bearer token.'
      }
    });
  }

  const token = authHeader.split(' ')[1];

  // 1. Check if guest session or demo session
  if (token.startsWith('guest_') || token.includes('guest') || token === 'demo_session_active') {
    req.user = {
      id: token.startsWith('guest_') ? token : 'guest_user_default',
      email: 'guest@voiceforge.ai',
      user_metadata: { full_name: 'Guest Creator' },
      isGuest: true
    };
    return next();
  }

  // 2. If Supabase is configured, verify with Supabase Auth
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !data.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Session has expired or token is invalid. Please sign in again.'
          }
        });
      }
      req.user = data.user;
      return next();
    } catch (err) {
      logger.error('Auth verification error:', err.message);
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: 'Unable to verify authentication.'
        }
      });
    }
  }

  // 3. Fallback demo user if Supabase is not configured yet
  req.user = {
    id: 'demo-user-default',
    email: 'developer@voiceforge.ai',
    user_metadata: { full_name: 'Developer' }
  };
  return next();
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token.startsWith('guest_') || token.includes('guest') || token === 'demo_session_active') {
      req.user = {
        id: token.startsWith('guest_') ? token : 'guest_user_default',
        email: 'guest@voiceforge.ai',
        user_metadata: { full_name: 'Guest Creator' },
        isGuest: true
      };
      return next();
    }

    if (supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin.auth.getUser(token);
        if (data?.user) {
          req.user = data.user;
        }
      } catch (_) {}
    }
  }
  next();
};
