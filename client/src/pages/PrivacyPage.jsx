import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div className="max-w-4xl mx-auto my-12 p-8 lattice-panel rounded-2xl border border-[#DFD6AE]/20 space-y-6 text-[#dfd8bc] text-sm leading-relaxed">
      <div className="flex items-center space-x-3 border-b border-[#3a5d61] pb-4">
        <Shield className="w-6 h-6 text-[#DFD6AE]" />
        <h1 className="text-2xl font-bold text-white font-mono">Privacy Policy // VoiceForge</h1>
      </div>

      <p className="text-xs font-mono text-[#DFD6AE]">LAST REVISED: NOVEMBER 2026</p>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">1. Data Ownership & Security</h2>
        <p>
          VoiceForge operates under strict Row Level Security (RLS) on Supabase PostgreSQL. Your audio recordings, transcripts, projects, and generated voices are solely accessible by your authenticated user session. We do not sell or lease user audio data to external third parties.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">2. AI Processing Pipeline</h2>
        <p>
          Audio inputs submitted for transcription and translation are processed via OpenAI Whisper and GPT-4o-mini APIs. Text synthesized into speech is processed via ElevenLabs API. Transmission is encrypted in transit using TLS 1.3.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">3. Audio Storage & Retention</h2>
        <p>
          Generated audio files and source files are stored in your private storage bucket. You retain full rights to delete individual records, audio history, or your entire account at any time through the Settings workspace.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">4. Voice Cloning Verification</h2>
        <p>
          VoiceForge adheres to strict ethical standards. Voice cloning requires verifiable consent from the voice owner. Unauthorized impersonation, defamatory voice generation, or non-consensual voice replication is strictly prohibited.
        </p>
      </section>
    </div>
  );
};

