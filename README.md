# VoiceForge | AI-Powered Voice Generation & Translation Platform
> Built on **Lattice Design Architecture** with high-precision neural voice synthesis, cross-lingual speech translation, and secure cloud storage.

![VoiceForge Architecture](https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80)

---

## 1. Project Overview

VoiceForge is a complete, production-grade AI SaaS application engineered for content creators, developers, global media, and educators. It unifies:
1. **Neural Text-to-Speech Studio**: High-fidelity speech synthesis powered by ElevenLabs API with real-time parameter tuning (speed, stability, similarity, style, and speaker boost) across 29+ languages.
2. **Speech Translation Studio**: Multi-stage audio pipeline combining browser MediaRecorder microphone capture or drag-and-drop file upload, OpenAI Whisper speech-to-text, OpenAI GPT-4o-mini translation with paragraph preservation, interactive human editing, and target voice re-synthesis.
3. **Voice Discovery Library**: Exploration of authentic provider voices filtered by actual provider metadata (male, female, language, and accent) without artificial classifications.
4. **Project Workspaces**: Multi-tier organization for grouping audio generations, scripts, and translation projects.
5. **Persistent Audio History & Storage**: Lossless audio storage via Supabase Storage and PostgreSQL with Row Level Security (RLS) guaranteeing strict user data isolation.

---

## 2. Technology Stack

### Frontend
- **React 18** & **Vite 6**
- **Lattice Design System**: Custom geometric grid lines, crosshair coordinate badges, obsidian slate/cyan palette, glowing border accents, soundwave animations
- **Tailwind CSS 3** with custom typography and audio visualizer keyframes
- **React Router v6**: Public & protected route guards
- **Lucide React**: High-tech vector iconography
- **Axios**: Configured with automated Supabase JWT bearer injection and structured error unwrapping
- **React Context**: `AuthContext` (auth state & session management) and `AudioContext` (global audio playback)

### Backend
- **Node.js 24** & **Express 4** (ES Modules)
- **RESTful API Architecture** with modular design: `config/`, `middleware/`, `modules/`, `providers/`, `services/`, `utils/`, `routes/`
- **Multer**: High-performance streaming audio upload validation (MP3, WAV, M4A, WEBM, FLAC)
- **FFmpeg 9**: Native audio probe, duration extraction, standard 44.1kHz MP3 conversion, and segment splitting for long recordings
- **Provider Abstraction Architecture**: `ElevenLabsProvider`, `OpenAIProvider`, and `ProviderFactory`

### Database & Authentication
- **Supabase PostgreSQL**: Relational schema with foreign keys, indexes, and automatic profile creation triggers
- **Supabase Auth**: Email/password authentication, password recovery, and JWT token verification
- **Supabase Storage**: Dedicated `audio-files` bucket with secure public/authenticated URLs
- **Row Level Security (RLS)**: Enforced policies ensuring users only access their own records

---

## 3. Project Structure

```text
Voiceforge/
├── client/                     # Vite React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Lattice UI components
│   │   │   ├── AudioPlayer.jsx # Audio player with scrubber, speed, download
│   │   │   ├── ConfigAlert.jsx # API key setup guide banner
│   │   │   ├── Footer.jsx      # Lattice architectural footer
│   │   │   ├── LatticeBackground.jsx # Grid backdrop & glows
│   │   │   ├── Navbar.jsx      # Navigation bar & live provider status
│   │   │   └── VoiceCard.jsx   # Voice card with audio preview & gender badge
│   │   ├── contexts/
│   │   │   ├── AudioContext.jsx# Global audio player state
│   │   │   └── AuthContext.jsx # Supabase session & user lifecycle
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx   # Master layout wrapper
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx # SaaS landing page with interactive previews
│   │   │   ├── LoginPage.jsx   # Sign in
│   │   │   ├── RegisterPage.jsx# Registration with auto profile creation
│   │   │   ├── ForgotPasswordPage.jsx # Password recovery
│   │   │   ├── PrivacyPage.jsx # Legal policy
│   │   │   ├── TermsPage.jsx   # Terms of service
│   │   │   ├── DashboardPage.jsx # Metrics, recent audio, projects
│   │   │   ├── TTSStudioPage.jsx # Full TTS synthesis workspace
│   │   │   ├── TranslationStudioPage.jsx # Speech translation pipeline
│   │   │   ├── VoiceLibraryPage.jsx # Voice explorer with sample player
│   │   │   ├── ProjectsPage.jsx# Workspace organizer
│   │   │   ├── AudioHistoryPage.jsx # Filterable generation history
│   │   │   ├── UsageSettingsPage.jsx# Quotas & API integration status
│   │   │   └── UserProfilePage.jsx  # Account preferences & deletion
│   │   ├── services/
│   │   │   ├── api.js          # Axios client with interceptors
│   │   │   └── supabase.js     # Supabase client initialization
│   │   ├── App.jsx             # Route definitions & protected guards
│   │   ├── index.css           # Lattice grid, scrollbars, and keyframes
│   │   └── main.jsx            # React root
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Node.js Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js          # Environment parser & provider check
│   │   │   └── supabase.js     # Supabase Admin client (service role)
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js # Supabase JWT token verification
│   │   │   ├── error.middleware.js# Structured error & credential masking
│   │   │   ├── rateLimiter.js  # Express rate limiters
│   │   │   └── upload.middleware.js # Multer audio validation
│   │   ├── modules/
│   │   │   ├── history.controller.js
│   │   │   ├── projects.controller.js
│   │   │   ├── speech.controller.js
│   │   │   ├── translation.controller.js
│   │   │   ├── usage.controller.js
│   │   │   └── voices.controller.js
│   │   ├── providers/
│   │   │   ├── elevenlabs.provider.js # ElevenLabs TTS & voice fetching
│   │   │   ├── openai.provider.js     # Whisper transcription & GPT-4o-mini
│   │   │   └── provider.factory.js    # Provider factory & health status
│   │   ├── routes/
│   │   │   └── index.js        # REST endpoints
│   │   ├── services/
│   │   │   ├── audio.service.js# FFmpeg metadata, conversion, segmenting
│   │   │   ├── storage.service.js # Supabase Storage & local fallback
│   │   │   └── usage.service.js# Character & minute usage aggregator
│   │   ├── utils/
│   │   │   ├── constants.js    # Supported models & language metadata
│   │   │   └── logger.js       # Formatted logger
│   │   └── index.js            # Express server entry point
│   └── package.json
│
├── supabase/
│   └── migrations/
│       └── 20261123000000_voiceforge_schema.sql # Complete SQL schema & RLS
│
├── .env.example                # Template for environment configuration
├── .gitignore
└── README.md
```

---

## 4. Setup and Installation

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+ (tested on npm 11)
- **FFmpeg**: Installed and accessible in your system PATH (VoiceForge includes automated probe and conversion utilities).

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd Voiceforge

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

## 5. Configuration & Environment Variables

Copy the provided `.env.example` into:
1. `server/.env`
2. `client/.env`

### Client Environment Variables (`client/.env`)
```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_API_BASE_URL=http://localhost:5000/api
```

### Server Environment Variables (`server/.env`)
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Supabase Admin / Service Role
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# AI Provider API Keys
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Storage Settings
STORAGE_MODE=supabase
MAX_AUDIO_UPLOAD_MB=25
```

> **Note on Developer Evaluation Mode**: If you start the app without setting API keys or Supabase credentials, VoiceForge features a built-in development inspection mode. It will show clean `CONFIG_REQUIRED` setup instructions with direct links to acquire the needed keys, while allowing you to inspect all pages and studios without crashes.

---

## 6. Supabase Project Setup & Database Migrations

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/20261123000000_voiceforge_schema.sql`, copy its contents, and execute the SQL query.
   - This creates all tables: `profiles`, `projects`, `audio_files`, `generations`, `translations`, `user_preferences`, and `usage_records`.
   - Enables Row Level Security (RLS) on all tables.
   - Sets up the `handle_new_user` trigger for automatic profile generation on user signup.
4. Go to **Storage** in your Supabase dashboard and create a public bucket named:
   - `audio-files`
5. Retrieve your project URL, Anon Key, and Service Role Key from **Settings -> API** and add them to your `.env` files.

---

## 7. AI Providers Setup

### ElevenLabs (Text-to-Speech)
1. Sign up at [elevenlabs.io](https://elevenlabs.io/).
2. Navigate to your profile -> **API Keys**.
3. Create a key and paste it as `ELEVENLABS_API_KEY` in `server/.env`.
4. This unlocks live voice fetching from `/v1/voices`, authentic male/female voice metadata, and speech synthesis via `eleven_multilingual_v2` and `eleven_turbo_v2_5`.

### OpenAI (Whisper Transcription & GPT-4o Translation)
1. Sign up at [platform.openai.com](https://platform.openai.com/).
2. Go to **API Keys** and generate a new secret key.
3. Paste it as `OPENAI_API_KEY` in `server/.env`.
4. This unlocks audio transcription via Whisper-1 and text translation via GPT-4o-mini.

---

## 8. Running the Application Locally

### Start Backend API Server
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend Application
In a separate terminal:
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.

---

## 9. Verification and Testing Checklist

- [x] **Backend API Routing**: Health check, status, languages, voices, speech generation, and translation routes operational.
- [x] **Client Build & Compilation**: Vite React JSX, Tailwind CSS, Lucide icons, and Lattice components build with 0 errors.
- [x] **Lattice Design System**: Custom geometric grid backgrounds, coordinate badges, dark theme, interactive cards, and responsive layouts.
- [x] **Authentication Flow**: Supabase signup, signin, session persistence, and local evaluation mode fallback.
- [x] **TTS Studio**: Script editor, character limit indicator, multi-model selection (Multilingual v2, Turbo v2.5, Flash), language selection, voice tuning sliders (stability, similarity, style, speed, speaker boost).
- [x] **Speech Translation Studio**: MediaRecorder microphone capture and drag-and-drop file upload, dual-stage transcription and translation, editable review panel, output voice selection, and completed audio comparison player.
- [x] **Voice Library**: Search, authentic gender filtering (all, female, male), accent filtering, sample audio preview, and favorite voice toggle.
- [x] **Audio History & Projects**: Full CRUD for projects and saved audio generations.
- [x] **Error Handling**: Graceful error handling for missing API keys, rate limits, invalid files, and network interruptions.

