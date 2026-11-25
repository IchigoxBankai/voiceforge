import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware setup
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static serving for local audio uploads fallback
app.use('/uploads', express.static(config.storage.uploadsDir));

// Rate limiting on API routes
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'VoiceForge Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', routes);

// Central Error Handler
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  logger.info(`VoiceForge API server running on port ${config.port} [${config.nodeEnv}]`);
  logger.info(`ElevenLabs Configured: ${config.isConfigured('elevenlabs') ? 'YES' : 'NO'}`);
  logger.info(`OpenAI Configured: ${config.isConfigured('openai') ? 'YES' : 'NO'}`);
  logger.info(`Supabase Configured: ${config.isConfigured('supabase') ? 'YES' : 'NO'}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

export default app;

