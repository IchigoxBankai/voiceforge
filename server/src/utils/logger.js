export const logger = {
  info: (message, meta = '') => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, meta ? meta : '');
  },
  warn: (message, meta = '') => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, meta ? meta : '');
  },
  error: (message, err = '') => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, err ? (err.stack || err) : '');
  },
  debug: (message, meta = '') => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] [${new Date().toISOString()}] ${message}`, meta ? meta : '');
    }
  }
};

