import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Key, Zap, CheckCircle2, AlertCircle, ExternalLink, HardDrive } from 'lucide-react';
import { api } from '../services/api';

export const UsageSettingsPage = () => {
  const [usage, setUsage] = useState({
    ttsCharacters: 0,
    audioMinutesProcessed: 0,
    translationCharacters: 0,
    totalGenerations: 0,
    totalTranslations: 0,
    limits: { maxTtsCharacters: 50000, maxAudioMinutes: 60, tier: 'Developer Free' }
  });
  const [providerStatus, setProviderStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/usage').catch(() => ({ usage: null })),
      api.get('/status').catch(() => ({ status: null }))
    ]).then(([uRes, sRes]) => {
      if (uRes?.usage) setUsage(uRes.usage);
      if (sRes?.status) setProviderStatus(sRes.status);
    }).finally(() => setLoading(false));
  }, []);

  const ttsPercent = Math.min(100, Math.round(((usage.ttsCharacters || 0) / (usage.limits?.maxTtsCharacters || 50000)) * 100));
  const audioPercent = Math.min(100, Math.round(((usage.audioMinutesProcessed || 0) / (usage.limits?.maxAudioMinutes || 60)) * 100));

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-[#3a5d61] pb-4">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#DFD6AE] mb-1">
          <Activity className="w-3.5 h-3.5" />
          <span>METRICS & INTEGRATIONS</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Usage Management & API Health</h1>
      </div>

      {/* TIER STATUS BANNER */}
      <div className="lattice-panel p-6 rounded-2xl border border-[#DFD6AE]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#274245] text-[#DFD6AE] border border-[#DFD6AE]/30">
            {usage.limits?.tier || 'DEVELOPER TIER'}
          </span>
          <h2 className="text-xl font-bold text-white mt-2">Active Subscription Plan</h2>
          <p className="text-xs text-[#b5ad8c] mt-0.5">
            Configurable quotas with local fallback or production Supabase limits.
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs text-[#b5ad8c]">
          <div className="p-3 rounded-lg bg-[#21383b] border border-[#3a5d61] text-center">
            <span className="block text-white font-bold">{usage.totalGenerations}</span>
            <span>Generations</span>
          </div>
          <div className="p-3 rounded-lg bg-[#21383b] border border-[#3a5d61] text-center">
            <span className="block text-white font-bold">{usage.totalTranslations}</span>
            <span>Translations</span>
          </div>
        </div>
      </div>

      {/* USAGE METERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TTS Characters */}
        <div className="lattice-panel p-6 rounded-2xl border border-[#3a5d61] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#b5ad8c]">Text-to-Speech Characters</span>
            <span className="text-sm font-bold font-mono text-[#DFD6AE]">{ttsPercent}%</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {usage.ttsCharacters.toLocaleString()} <span className="text-xs text-[#9ab0b2] font-normal">/ {(usage.limits?.maxTtsCharacters || 50000).toLocaleString()} chars</span>
          </div>
          <div className="w-full bg-[#2e4c50] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#DFD6AE] h-full rounded-full transition-all duration-500"
              style={{ width: `${ttsPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#9ab0b2] font-mono">
            Directly synced to ElevenLabs synthesis usage.
          </p>
        </div>

        {/* Audio Minutes */}
        <div className="lattice-panel p-6 rounded-2xl border border-[#3a5d61] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#b5ad8c]">Transcription & Translation</span>
            <span className="text-sm font-bold font-mono text-[#DFD6AE]">{audioPercent}%</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {usage.audioMinutesProcessed} <span className="text-xs text-[#9ab0b2] font-normal">/ {usage.limits?.maxAudioMinutes || 60} mins</span>
          </div>
          <div className="w-full bg-[#2e4c50] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#DFD6AE] h-full rounded-full transition-all duration-500"
              style={{ width: `${audioPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#9ab0b2] font-mono">
            Calculated via FFmpeg audio probe and Whisper transcription duration.
          </p>
        </div>
      </div>

      {/* PROVIDER INTEGRATION STATUS */}
      <div className="lattice-panel p-6 rounded-2xl border border-[#DFD6AE]/20 space-y-6">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Key className="w-4 h-4 text-[#DFD6AE]" />
          <span>AI Engine & Cloud Provider Status</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ElevenLabs */}
          <div className="p-4 rounded-xl bg-[#21383b] border border-[#3a5d61] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">ElevenLabs</span>
              {providerStatus?.elevenlabs?.configured ? (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">CONNECTED</span>
              ) : (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800">KEY MISSING</span>
              )}
            </div>
            <p className="text-[11px] text-[#b5ad8c]">Powers TTS voice synthesis and realistic emotional vocal models.</p>
            <div className="text-[11px] font-mono text-[#9ab0b2]">ENV: ELEVENLABS_API_KEY</div>
          </div>

          {/* OpenAI */}
          <div className="p-4 rounded-xl bg-[#21383b] border border-[#3a5d61] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">OpenAI</span>
              {providerStatus?.openai?.configured ? (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">CONNECTED</span>
              ) : (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800">KEY MISSING</span>
              )}
            </div>
            <p className="text-[11px] text-[#b5ad8c]">Powers Whisper speech-to-text and GPT-4o-mini translation.</p>
            <div className="text-[11px] font-mono text-[#9ab0b2]">ENV: OPENAI_API_KEY</div>
          </div>

          {/* Supabase */}
          <div className="p-4 rounded-xl bg-[#21383b] border border-[#3a5d61] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Supabase</span>
              {providerStatus?.supabase?.configured ? (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">CONNECTED</span>
              ) : (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800">LOCAL FALLBACK</span>
              )}
            </div>
            <p className="text-[11px] text-[#b5ad8c]">PostgreSQL database, Row Level Security, and audio file buckets.</p>
            <div className="text-[11px] font-mono text-[#9ab0b2]">ENV: SUPABASE_URL</div>
          </div>
        </div>
      </div>
    </div>
  );
};

