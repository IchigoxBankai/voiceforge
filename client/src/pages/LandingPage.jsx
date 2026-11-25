import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AudioWaveform, Sparkles, Globe, Mic, ArrowRight, CheckCircle2, 
  Layers, Volume2, ShieldCheck, Zap, Terminal, Sliders, ChevronDown
} from 'lucide-react';

export const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [demoText, setDemoText] = useState('VoiceForge turns digital text and speech into emotionally expressive, studio-grade voices across 29 languages.');
  const [demoLanguage, setDemoLanguage] = useState('en');

  const faqs = [
    {
      q: 'How does VoiceForge generate realistic voices?',
      a: 'VoiceForge connects directly to ElevenLabs neural voice models (such as Eleven Multilingual v2 and Turbo v2.5), synthesizing lifelike inflections, pacing, and emotional nuance without artificial robotic artifacts.'
    },
    {
      q: 'How does the speech translation workflow operate?',
      a: 'VoiceForge implements a 2-step pipeline: it first transcribes input audio using OpenAI Whisper, translates the transcript to your target language via GPT-4o-mini preserving paragraph structure, allows you to review and edit the transcript, and synthesizes the translated text using your chosen voice.'
    },
    {
      q: 'Can I choose between male and female voices?',
      a: 'Yes. VoiceForge indexes actual provider metadata to provide genuine male, female, accent, and style filtering without fabricating classifications.'
    },
    {
      q: 'Where are my generated audio files stored?',
      a: 'Your audio files and metadata are securely stored in Supabase PostgreSQL and Supabase Storage with strict Row Level Security (RLS) guaranteeing that only you can access your audio assets.'
    },
    {
      q: 'Can I clone voices without permission?',
      a: 'No. VoiceForge enforces strict safety and verification guidelines. Voice cloning requires verified authorization to prevent unauthorized impersonation.'
    }
  ];

  return (
    <div className="space-y-24 py-6 font-sans">
      {/* HERO SECTION */}
      <section className="relative text-center pt-8 pb-16 lg:pt-16 lg:pb-20">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-[#DFD6AE]/30 bg-[#274245]/60 text-[#ebe4c5] text-xs font-mono mb-8 lattice-cross">
          <Sparkles className="w-3.5 h-3.5 text-[#DFD6AE]" />
          <span>LATTICE NEURAL AUDIO SUITE // ELEVENLABS & OPENAI ENGINE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Synthesize Reality. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DFD6AE] via-[#f5f0dc] to-[#b5ad8c]">
            Translate Across Borders.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#b5ad8c] max-w-2xl mx-auto leading-relaxed">
          The production-grade AI platform for studio-quality text-to-speech generation and cross-lingual speech translation. Built for creators, developers, and global media.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#DFD6AE] to-[#cbbd8b] hover:from-[#ebe4c5] hover:to-[#DFD6AE] text-black font-semibold text-sm transition-all shadow-[0_0_30px_rgba(223,214,174,0.4)] flex items-center justify-center gap-2"
          >
            Launch Voice Studio <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-[#DFD6AE]/20 bg-[#21383b]/80 hover:bg-[#2e4c50] text-[#dfd8bc] hover:text-white font-medium text-sm transition-colors"
          >
            Sign In / Guest Access
          </Link>
        </div>

        {/* Interactive Lattice Preview Box */}
        <div className="mt-16 max-w-4xl mx-auto lattice-panel p-6 sm:p-8 rounded-2xl border border-[#DFD6AE]/30 shadow-[0_0_50px_rgba(223,214,174,0.15)] text-left relative">
          <div className="flex items-center justify-between border-b border-[#3a5d61] pb-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 font-mono text-xs text-[#b5ad8c]">VOICEFORGE_STUDIO_TERMINAL</span>
            </div>
            <div className="flex items-center space-x-2 font-mono text-xs text-[#DFD6AE]">
              <span className="w-2 h-2 rounded-full bg-[#DFD6AE] animate-ping" />
              <span>LIVE INTERACTION</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-mono text-[#b5ad8c] uppercase tracking-wider">
                Input Text Preview
              </label>
              <textarea
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                rows={3}
                className="w-full bg-[#162729]/80 border border-[#3a5d61] rounded-lg p-3 text-sm text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE] resize-none font-sans"
              />
              <div className="flex items-center justify-between text-xs font-mono text-[#b5ad8c]">
                <span>{demoText.length} characters</span>
                <span className="text-[#DFD6AE]">Model: Eleven Multilingual v2</span>
              </div>
            </div>

            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-mono text-[#b5ad8c] uppercase tracking-wider mb-2">
                  Voice Synthesis
                </label>
                <div className="p-3 rounded-lg bg-[#21383b] border border-[#3a5d61] flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#274245] flex items-center justify-center border border-[#DFD6AE]/30">
                    <AudioWaveform className="w-4 h-4 text-[#DFD6AE]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Rachel</div>
                    <div className="text-[10px] font-mono text-[#b5ad8c]">Female • American Calm</div>
                  </div>
                </div>
              </div>

              <Link
                to="/tts"
                className="w-full py-2.5 rounded-lg bg-[#DFD6AE]/20 hover:bg-[#DFD6AE]/30 border border-[#DFD6AE]/40 text-[#ebe4c5] text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Synthesize in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SHOWCASE */}
      <section id="features" className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#DFD6AE]">
            [ARCHITECTURE & CAPABILITIES]
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white">
            Dual AI Engine Architecture
          </h3>
          <p className="text-sm text-[#b5ad8c] max-w-xl mx-auto">
            Combining the world's most expressive speech synthesis models with state-of-the-art multilingual transcript translation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* TTS Feature Card */}
          <div className="lattice-panel p-8 rounded-2xl border border-[#DFD6AE]/20 hover:border-[#DFD6AE]/40 transition-all duration-300 relative group">
            <div className="w-12 h-12 rounded-xl bg-[#274245]/90 border border-[#DFD6AE]/30 flex items-center justify-center text-[#DFD6AE] mb-6 group-hover:scale-105 transition-transform">
              <AudioWaveform className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Neural Text-to-Speech Studio</h4>
            <p className="text-sm text-[#b5ad8c] leading-relaxed mb-6">
              Generate studio-grade speech from text in seconds. Adjust stability, clarity, speaking speed, and emotional style with real-time audio playback and lossless downloads.
            </p>
            <ul className="space-y-2.5 text-xs font-mono text-[#dfd8bc] mb-6">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> Multi-model compatibility (Multilingual v2, Turbo v2.5, Flash)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> Real-time character counts and model validation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> Genuine provider voice filtering by gender and accent</li>
            </ul>
            <Link to="/tts" className="text-xs font-mono text-[#DFD6AE] hover:text-[#ebe4c5] flex items-center gap-1 font-semibold">
              Open TTS Studio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Translation Feature Card */}
          <div className="lattice-panel p-8 rounded-2xl border border-[#DFD6AE]/20 hover:border-[#DFD6AE]/40 transition-all duration-300 relative group">
            <div className="w-12 h-12 rounded-xl bg-[#274245]/90 border border-[#DFD6AE]/30 flex items-center justify-center text-[#DFD6AE] mb-6 group-hover:scale-105 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Speech Translation Studio</h4>
            <p className="text-sm text-[#b5ad8c] leading-relaxed mb-6">
              Upload recordings or speak into your microphone. VoiceForge executes OpenAI Whisper transcription, intelligent translation via GPT-4o-mini, and re-synthesizes speech in your target voice.
            </p>
            <ul className="space-y-2.5 text-xs font-mono text-[#dfd8bc] mb-6">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> Browser MediaRecorder microphone capture & file uploads</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> Side-by-side dual panel with editable translation review</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> FFmpeg audio duration segmentation for long recordings</li>
            </ul>
            <Link to="/translation" className="text-xs font-mono text-[#DFD6AE] hover:text-indigo-300 flex items-center gap-1 font-semibold">
              Open Translation Studio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lattice-panel p-8 sm:p-12 rounded-3xl border border-[#DFD6AE]/20">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#DFD6AE]">
            [WORKFLOW PIPELINE]
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">How VoiceForge Works</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 relative p-6 rounded-xl bg-[#21383b]/50 border border-[#3a5d61]">
            <div className="font-mono text-[#DFD6AE] text-xs font-bold">01 // INGESTION</div>
            <h4 className="text-base font-bold text-white">Input Text or Audio</h4>
            <p className="text-xs text-[#b5ad8c] leading-relaxed">
              Type or paste your script, or record and upload source audio in MP3, WAV, M4A, or WEBM formats.
            </p>
          </div>

          <div className="space-y-3 relative p-6 rounded-xl bg-[#21383b]/50 border border-[#3a5d61]">
            <div className="font-mono text-[#DFD6AE] text-xs font-bold">02 // PROCESSING</div>
            <h4 className="text-base font-bold text-white">AI Transcribe & Translate</h4>
            <p className="text-xs text-[#b5ad8c] leading-relaxed">
              Whisper transcribes spoken nuances, GPT-4o-mini translates contextual meanings, and you can edit results prior to speech synthesis.
            </p>
          </div>

          <div className="space-y-3 relative p-6 rounded-xl bg-[#21383b]/50 border border-[#3a5d61]">
            <div className="font-mono text-[#DFD6AE] text-xs font-bold">03 // SYNTHESIS & STORAGE</div>
            <h4 className="text-base font-bold text-white">Neural Voice Output</h4>
            <p className="text-xs text-[#b5ad8c] leading-relaxed">
              ElevenLabs renders human-grade speech. The audio is stored in Supabase with RLS and instant download options.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section id="pricing" className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#DFD6AE]">
            [MONETIZATION & TIERS]
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white">Simple, Transparent Pricing</h3>
          <p className="text-sm text-[#b5ad8c] max-w-xl mx-auto">
            Choose the plan that fits your production workload. Bring your own keys or subscribe for turnkey infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free / Starter */}
          <div className="lattice-panel p-8 rounded-2xl border border-[#3a5d61] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#b5ad8c] uppercase">Developer Free</div>
              <div className="mt-4 text-3xl font-extrabold text-white">$0 <span className="text-xs text-[#9ab0b2] font-normal">/ month</span></div>
              <p className="mt-2 text-xs text-[#b5ad8c]">Ideal for personal experimentation and local API keys.</p>
              <ul className="mt-6 space-y-3 text-xs text-[#dfd8bc]">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> 10,000 characters / month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> Standard ElevenLabs voices</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> 15 audio translation minutes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> Community support</li>
              </ul>
            </div>
            <Link to="/register" className="mt-8 block text-center py-2.5 rounded-lg border border-[#497176] text-xs font-mono text-[#eae4cb] hover:bg-[#2e4c50] transition-colors">
              Get Started Free
            </Link>
          </div>

          {/* Pro / Creator */}
          <div className="lattice-panel p-8 rounded-2xl border border-[#DFD6AE]/40 relative shadow-[0_0_30px_rgba(223,214,174,0.15)] flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#DFD6AE] text-black font-mono text-[10px] font-bold">
              MOST POPULAR
            </div>
            <div>
              <div className="text-xs font-mono text-[#DFD6AE] uppercase">Creator Pro</div>
              <div className="mt-4 text-3xl font-extrabold text-white">$29 <span className="text-xs text-[#9ab0b2] font-normal">/ month</span></div>
              <p className="mt-2 text-xs text-[#b5ad8c]">For YouTubers, podcasters, and content creators.</p>
              <ul className="mt-6 space-y-3 text-xs text-[#dfd8bc]">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> 250,000 characters / month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> Full Voice Library access</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> 120 audio translation minutes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> FFmpeg high-bitrate MP3 & WAV</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> Unlimited Project Workspaces</li>
              </ul>
            </div>
            <Link to="/register" className="mt-8 block text-center py-2.5 rounded-lg bg-[#DFD6AE] hover:bg-[#DFD6AE] text-black text-xs font-mono font-bold transition-colors">
              Upgrade to Pro
            </Link>
          </div>

          {/* Enterprise */}
          <div className="lattice-panel p-8 rounded-2xl border border-[#3a5d61] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#b5ad8c] uppercase">Enterprise Scale</div>
              <div className="mt-4 text-3xl font-extrabold text-white">$149 <span className="text-xs text-[#9ab0b2] font-normal">/ month</span></div>
              <p className="mt-2 text-xs text-[#b5ad8c]">Dedicated capacity, high concurrency, and custom voices.</p>
              <ul className="mt-6 space-y-3 text-xs text-[#dfd8bc]">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> 2,000,000+ characters / month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> Priority API concurrency</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> Dedicated Supabase Storage bucket</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#DFD6AE]" /> 24/7 SLA & Enterprise onboarding</li>
              </ul>
            </div>
            <Link to="/register" className="mt-8 block text-center py-2.5 rounded-lg border border-[#497176] text-xs font-mono text-[#eae4cb] hover:bg-[#2e4c50] transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#DFD6AE]">
            [FREQUENTLY ASKED QUESTIONS]
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Technical Answers</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="lattice-panel rounded-xl border border-[#3a5d61] overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-sm font-medium text-[#eae4cb] hover:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-[#b5ad8c] transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="p-4 pt-0 text-xs text-[#b5ad8c] leading-relaxed border-t border-[#3a5d61]/60 font-sans">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CALL TO ACTION */}
      <section className="lattice-panel p-8 sm:p-14 rounded-3xl border border-[#DFD6AE]/30 text-center relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Forge Your Voices?
          </h3>
          <p className="text-sm text-[#dfd8bc]">
            Create an account in seconds and unlock studio-grade voice generation and multilingual speech translation.
          </p>
          <div className="pt-4 flex justify-center">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl bg-[#DFD6AE] hover:bg-[#ebe4c5] text-black font-semibold text-sm transition-all shadow-[0_0_25px_rgba(223,214,174,0.4)] flex items-center gap-2"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

