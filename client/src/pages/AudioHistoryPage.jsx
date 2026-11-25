import React, { useState, useEffect } from 'react';
import { History, Search, Trash2, Download, Play, AudioWaveform, Globe, Calendar, Filter } from 'lucide-react';
import { api } from '../services/api';
import { AudioPlayer } from '../components/AudioPlayer';

export const AudioHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [activePlayerItem, setActivePlayerItem] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [filterType]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/history?type=${filterType}&search=${encodeURIComponent(search)}`);
      if (res.history) setHistory(res.history);
    } catch (err) {
      console.warn('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this generation record?')) return;
    try {
      await api.delete(`/history/${id}`);
      setHistory(history.filter(h => h.id !== id));
      if (activePlayerItem?.id === id) setActivePlayerItem(null);
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-[#3a5d61] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#DFD6AE] mb-1">
            <History className="w-3.5 h-3.5" />
            <span>PERSISTENT GENERATION LOG</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audio Generation History</h1>
        </div>

        <span className="text-xs font-mono text-[#9ab0b2]">{history.length} Saved Generations</span>
      </div>

      {/* FILTER & SEARCH */}
      <div className="lattice-panel p-4 rounded-xl border border-[#DFD6AE]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ab0b2]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompt or voice..."
            className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg pl-9 pr-3 py-2 text-xs text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE] font-sans"
          />
        </form>

        <div className="flex items-center space-x-1.5 bg-[#162729] p-1 rounded-lg border border-[#3a5d61] font-mono text-xs w-full sm:w-auto">
          {['all', 'tts', 'translation'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded capitalize transition-colors ${
                filterType === t ? 'bg-[#DFD6AE] text-black font-semibold' : 'text-[#b5ad8c] hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* HISTORY TABLE / CARDS */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="lattice-panel p-4 rounded-xl border border-[#3a5d61] animate-pulse h-20" />
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="lattice-panel p-4 rounded-xl border border-[#3a5d61] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                    item.generation_type === 'tts'
                      ? 'bg-[#274245]/70 text-[#DFD6AE] border-[#DFD6AE]/30/40'
                      : 'bg-[#274245]/70 text-[#DFD6AE] border-[#DFD6AE]/30'
                  }`}>
                    {item.generation_type}
                  </span>
                  <span className="text-sm font-semibold text-white">{item.voice_name || 'Neural Voice'}</span>
                  {item.duration_seconds > 0 && (
                    <span className="text-xs font-mono text-[#9ab0b2]">{item.duration_seconds}s</span>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono text-[#9ab0b2]">
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-[#9ab0b2] hover:text-red-400 p-1"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#b5ad8c] italic line-clamp-2">
                "{item.input_text}"
              </p>

              {item.audio_url && (
                <AudioPlayer
                  audioUrl={item.audio_url}
                  title={item.voice_name || 'Audio Generation'}
                  duration={item.duration_seconds}
                  className="bg-black/40 mt-1"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="lattice-panel p-12 rounded-2xl border border-[#3a5d61] text-center space-y-3">
          <History className="w-8 h-8 text-[#7c9496] mx-auto" />
          <h3 className="text-sm font-semibold text-[#dfd8bc]">No history found</h3>
          <p className="text-xs text-[#9ab0b2]">Generations will appear here once synthesized.</p>
        </div>
      )}
    </div>
  );
};

