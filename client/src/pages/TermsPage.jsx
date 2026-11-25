import React from 'react';
import { FileText } from 'lucide-react';

export const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto my-12 p-8 lattice-panel rounded-2xl border border-[#DFD6AE]/20 space-y-6 text-[#dfd8bc] text-sm leading-relaxed">
      <div className="flex items-center space-x-3 border-b border-[#3a5d61] pb-4">
        <FileText className="w-6 h-6 text-[#DFD6AE]" />
        <h1 className="text-2xl font-bold text-white font-mono">Terms of Service // VoiceForge</h1>
      </div>

      <p className="text-xs font-mono text-[#DFD6AE]">LAST REVISED: NOVEMBER 2026</p>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
        <p>
          By creating an account or accessing the VoiceForge platform, you agree to comply with these Terms of Service, applicable laws, and regulations governing AI technologies and digital communications.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">2. Acceptable Use Policy</h2>
        <p>
          You agree not to use VoiceForge to generate harmful, fraudulent, harassing, infringing, or illegal audio content. Any attempt to impersonate individuals without documented authorization will result in immediate account termination.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">3. API Credentials & Fair Use</h2>
        <p>
          When using self-configured API credentials (such as ElevenLabs or OpenAI API keys), you are responsible for maintaining the confidentiality of your keys and any usage incurred on your provider accounts.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-white">4. Commercial Rights</h2>
        <p>
          Subject to provider tier terms, you own the audio content generated through your account for personal and commercial applications, including podcasts, videos, audiobooks, and interactive media.
        </p>
      </section>
    </div>
  );
};

