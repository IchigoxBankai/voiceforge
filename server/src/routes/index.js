import { Router } from 'express';
import { getVoices, getLanguages, getSystemStatus } from '../modules/voices.controller.js';
import { generateSpeech } from '../modules/speech.controller.js';
import { transcribeAudio, translateText, createTranslationProject, getTranslationById } from '../modules/translation.controller.js';
import { getHistory, deleteHistoryItem } from '../modules/history.controller.js';
import { getProjects, createProject, updateProject, deleteProject } from '../modules/projects.controller.js';
import { getUsage } from '../modules/usage.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { audioUpload } from '../middleware/upload.middleware.js';
import { generationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public / Discovery routes
router.get('/status', getSystemStatus);
router.get('/languages', getLanguages);
router.get('/voices', optionalAuth, getVoices);

// Text-to-Speech Studio
router.post('/speech/generate', requireAuth, generationLimiter, generateSpeech);

// Speech Translation Studio
router.post('/translation/transcribe', requireAuth, generationLimiter, audioUpload.single('audio'), transcribeAudio);
router.post('/translation/translate-text', requireAuth, generationLimiter, translateText);
router.post('/translation/create', requireAuth, generationLimiter, createTranslationProject);
router.get('/translation/:id', requireAuth, getTranslationById);

// Projects
router.get('/projects', requireAuth, getProjects);
router.post('/projects', requireAuth, createProject);
router.patch('/projects/:id', requireAuth, updateProject);
router.delete('/projects/:id', requireAuth, deleteProject);

// History
router.get('/history', requireAuth, getHistory);
router.delete('/history/:id', requireAuth, deleteHistoryItem);

// Usage
router.get('/usage', requireAuth, getUsage);

export default router;

