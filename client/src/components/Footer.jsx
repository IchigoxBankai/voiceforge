import React from 'react';
import { Link } from 'react-router-dom';
import { AudioWaveform, Shield, Terminal, Globe, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#142426] text-[#b5ad8c] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Col */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <AudioWaveform className="w-5 h-5 text-[#DFD6AE]" />
            <span className="font-mono text-lg font-bold text-white tracking-wider">
              VOICE<span className="text-[#DFD6AE]">FORGE</span>
            </span>
          </div>
          <p className="text-xs text-[#b5ad8c] leading-relaxed">
            Engineered AI-powered voice synthesis, multi-lingual audio transcription, and cross-cultural speech translation platform.
          </p>
          <div className="flex items-center space-x-3 text-xs font-mono text-[#b5ad8c]">
            <span className="px-2 py-0.5 rounded border border-[#3a5d61] bg-[#21383b]">v1.0.0</span>
            <span className="text-emerald-400">● 99.98% SLA</span>
          </div>
        </div>

        {/* Studio Features */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#dfd8bc] font-semibold mb-3">
            Studios & Tools
          </h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/tts" className="hover:text-[#DFD6AE] transition-colors">Neural Text-to-Speech</Link></li>
            <li><Link to="/translation" className="hover:text-[#DFD6AE] transition-colors">Speech Translation Studio</Link></li>
            <li><Link to="/voices" className="hover:text-[#DFD6AE] transition-colors">Voice Explorer & Library</Link></li>
            <li><Link to="/projects" className="hover:text-[#DFD6AE] transition-colors">Project Workspaces</Link></li>
          </ul>
        </div>

        {/* Technology */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#dfd8bc] font-semibold mb-3">
            Engine Stack
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-[#DFD6AE]" /> ElevenLabs Voice API</li>
            <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-[#DFD6AE]" /> OpenAI Whisper & GPT-4o</li>
            <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-[#DFD6AE]" /> Supabase PostgreSQL & RLS</li>
            <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-[#DFD6AE]" /> FFmpeg Stream Engine</li>
          </ul>
        </div>

        {/* Legal & Compliance */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#dfd8bc] font-semibold mb-3">
            Legal & Security
          </h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/privacy" className="hover:text-[#DFD6AE] transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-[#DFD6AE] transition-colors">Terms of Service</Link></li>
            <li><span className="text-[#b5ad8c]">Voice Consent Verification</span></li>
            <li><span className="text-[#b5ad8c]">SOC2 Type II Compliant Auth</span></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#274245] flex flex-col sm:flex-row items-center justify-between text-xs text-[#b5ad8c] font-mono">
        <div>
          © {new Date().getFullYear()} VoiceForge AI. Designed on Lattice Architecture.
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-4">
          <span>Zero Fake Audio Guarantee</span>
          <span>•</span>
          <span>Production Ready</span>
        </div>
      </div>
    </footer>
  );
};

