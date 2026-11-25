import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root or parent
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },

  ai: {
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
  },

  storage: {
    mode: process.env.STORAGE_MODE || 'supabase', // 'supabase' or 'local'
    bucketName: 'audio-files',
    maxUploadSizeMb: parseInt(process.env.MAX_AUDIO_UPLOAD_MB || '25', 10),
    tempDir: path.resolve(__dirname, '../../temp'),
    uploadsDir: path.resolve(__dirname, '../../uploads'),
  },

  isConfigured(service) {
    switch (service) {
      case 'elevenlabs':
        return Boolean(this.ai.elevenlabsApiKey && !this.ai.elevenlabsApiKey.includes('your_'));
      case 'openai':
        return Boolean(this.ai.openaiApiKey && !this.ai.openaiApiKey.includes('your_'));
      case 'supabase':
        return Boolean(this.supabase.url && this.supabase.serviceRoleKey && !this.supabase.url.includes('your-project'));
      default:
        return false;
    }
  }
};

