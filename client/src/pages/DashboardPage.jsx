import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AudioWaveform, Globe, Mic, History, FolderKanban, 
  ArrowRight, Sparkles, Clock, Activity, HardDrive, Plus, Play
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { AudioPlayer } from '../components/AudioPlayer';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    ttsCharacters: 0,
    audioMinutesProcessed: 0,
    totalGenerations: 0,
    totalTranslations: 0,
    limits: { maxTtsCharacters: 50000, maxAudioMinutes: 60, tier: 'Developer Free' }
  });
  const [recentGenerations, setRecentGenerations] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usageRes, historyRes, projectsRes] = await Promise.all([
          api.get('/usage').catch(() => ({ usage: null })),
          api.get('/history?limit=5').catch(() => ({ history: [] })),
          api.get('/projects').catch(() => ({ projects: [] }))
        ]);

        if (usageRes?.usage) setStats(usageRes.usage);
        if (historyRes?.history) setRecentGenerations(historyRes.history.slice(0, 4));
        if (projectsRes?.projects) setRecentProjects(projectsRes.projects.slice(0, 4));
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const ttsPercentage = Math.min(100, Math.round(((stats.ttsCharacters || 0) / (stats.limits?.maxTtsCharacters || 50000)) * 100));

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="lattice-panel p-6 sm:p-8 rounded-2xl border border-[#DFD6AE]/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#DFD6AE] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#DFD6AE] animate-pulse" />
              <span>VOICEFORGE // WORKSPACE ACTIVE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </h1>
            <p className="mt-1 text-xs text-[#b5ad8c] max-w-xl">
              Synthesize neural speech, translate audio recordings, and manage your sound assets with studio precision.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/tts"
              className="px-4 py-2.5 rounded-lg bg-[#DFD6AE] hover:bg-[#ebe4c5] text-black font-semibold text-xs font-mono transition-all shadow-[0_0_15px_rgba(223,214,174,0.3)] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Speech</span>
            </Link>
            <Link
              to="/translation"
              className="px-4 py-2.5 rounded-lg border border-[#497176] bg-[#21383b] hover:bg-[#2e4c50] text-[#eae4cb] text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-4 h-4 text-[#DFD6AE]" />
              <span>Translate Audio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Audio Generated */}
        <div className="lattice-panel p-5 rounded-xl border border-[#3a5d61]">
          <div className="flex items-center justify-between text-[#b5ad8c] mb-2">
            <span className="text-xs font-mono uppercase">Audio Generated</span>
            <AudioWaveform className="w-4 h-4 text-[#DFD6AE]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.totalGenerations}</div>
          <div className="mt-1 text-[11px] text-[#9ab0b2] font-mono">
            {stats.ttsCharacters.toLocaleString()} characters synthesized
          </div>
        </div>

        {/* Total Translations */}
        <div className="lattice-panel p-5 rounded-xl border border-[#3a5d61]">
          <div className="flex items-center justify-between text-[#b5ad8c] mb-2">
            <span className="text-xs font-mono uppercase">Translations</span>
            <Globe className="w-4 h-4 text-[#DFD6AE]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.totalTranslations}</div>
          <div className="mt-1 text-[11px] text-[#9ab0b2] font-mono">
            {stats.audioMinutesProcessed} audio minutes processed
          </div>
        </div>

        {/* Quota Progress */}
        <div className="lattice-panel p-5 rounded-xl border border-[#3a5d61]">
          <div className="flex items-center justify-between text-[#b5ad8c] mb-2">
            <span className="text-xs font-mono uppercase">Monthly Quota</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{ttsPercentage}%</div>
          <div className="w-full bg-[#2e4c50] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#DFD6AE] h-full rounded-full transition-all duration-500"
              style={{ width: `${ttsPercentage}%` }}
            />
          </div>
        </div>

        {/* Active Projects */}
        <div className="lattice-panel p-5 rounded-xl border border-[#3a5d61]">
          <div className="flex items-center justify-between text-[#b5ad8c] mb-2">
            <span className="text-xs font-mono uppercase">Workspaces</span>
            <FolderKanban className="w-4 h-4 text-[#DFD6AE]" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{recentProjects.length}</div>
          <div className="mt-1 text-[11px] text-[#9ab0b2] font-mono">
            {stats.limits?.tier || 'Developer Tier'}
          </div>
        </div>
      </div>

      {/* RECENT GENERATIONS & RECENT PROJECTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Generations (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-wider text-[#eae4cb] font-semibold flex items-center gap-2">
              <AudioWaveform className="w-4 h-4 text-[#DFD6AE]" />
              <span>Recent Audio Generations</span>
            </h2>
            <Link to="/history" className="text-xs font-mono text-[#DFD6AE] hover:text-[#ebe4c5] flex items-center gap-1">
              View History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentGenerations.length > 0 ? (
            <div className="space-y-3">
              {recentGenerations.map((item) => (
                <div key={item.id} className="lattice-panel p-4 rounded-xl border border-[#3a5d61] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#f5f0dc] flex items-center gap-2">
                      <span className="font-mono text-[#DFD6AE] uppercase text-[10px] px-1.5 py-0.5 rounded bg-[#274245] border border-[#DFD6AE]/30">
                        {item.generation_type}
                      </span>
                      {item.voice_name || 'Neural Voice'}
                    </span>
                    <span className="font-mono text-[#9ab0b2] text-[11px]">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-[#b5ad8c] line-clamp-1 italic">
                    "{item.input_text}"
                  </p>

                  {item.audio_url && (
                    <AudioPlayer
                      audioUrl={item.audio_url}
                      title={item.voice_name || 'Generated Audio'}
                      duration={item.duration_seconds}
                      className="mt-2 bg-black/40"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="lattice-panel p-8 rounded-xl border border-[#3a5d61]/80 text-center space-y-3">
              <AudioWaveform className="w-8 h-8 text-[#7c9496] mx-auto" />
              <p className="text-xs text-[#b5ad8c]">No audio generations recorded yet.</p>
              <Link
                to="/tts"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#DFD6AE]/20 text-[#ebe4c5] text-xs font-mono border border-[#DFD6AE]/30 hover:bg-[#DFD6AE]/30"
              >
                <span>Synthesize your first script</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Projects & Actions (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-wider text-[#eae4cb] font-semibold flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#DFD6AE]" />
              <span>Workspaces</span>
            </h2>
            <Link to="/projects" className="text-xs font-mono text-[#DFD6AE] hover:text-[#ebe4c5] flex items-center gap-1">
              All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentProjects.length > 0 ? (
              recentProjects.map((p) => (
                <div key={p.id} className="lattice-panel p-3.5 rounded-xl border border-[#3a5d61] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                    <span className="text-[10px] font-mono text-[#9ab0b2] uppercase">{p.project_type}</span>
                  </div>
                  <Link to={`/projects`} className="p-1.5 rounded hover:bg-[#2e4c50] text-[#b5ad8c] hover:text-white">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="lattice-panel p-6 rounded-xl border border-[#3a5d61]/80 text-center space-y-2">
                <FolderKanban className="w-6 h-6 text-[#7c9496] mx-auto" />
                <p className="text-xs text-[#b5ad8c]">No projects created yet.</p>
                <Link
                  to="/projects"
                  className="text-xs font-mono text-[#DFD6AE] hover:underline inline-block mt-1"
                >
                  Create a project
                </Link>
              </div>
            )}
          </div>

          {/* Quick studio shortcuts card */}
          <div className="lattice-panel p-4 rounded-xl border border-[#DFD6AE]/30 bg-[#274245]/30 space-y-3 mt-6">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#ebe4c5] font-semibold">
              <Sparkles className="w-4 h-4 text-[#DFD6AE]" />
              <span>Quick Navigation</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <Link to="/voices" className="p-2 rounded bg-[#21383b] border border-[#3a5d61] hover:border-[#DFD6AE]/50 text-[#dfd8bc] hover:text-white text-center">
                Browse Voices
              </Link>
              <Link to="/settings" className="p-2 rounded bg-[#21383b] border border-[#3a5d61] hover:border-[#DFD6AE]/50 text-[#dfd8bc] hover:text-white text-center">
                API Config
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

