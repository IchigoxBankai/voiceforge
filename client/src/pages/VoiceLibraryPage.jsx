import React, { useState, useEffect } from 'react';
import { Volume2, Search, Filter, RefreshCw, Star, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { VoiceCard } from '../components/VoiceCard';
import { ConfigAlert } from '../components/ConfigAlert';

export const VoiceLibraryPage = () => {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [accentFilter, setAccentFilter] = useState('all');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vf_favorite_voices') || '[]');
    } catch { return []; }
  });
  const [configMissing, setConfigMissing] = useState(false);

  useEffect(() => {
    fetchVoices();
  }, [genderFilter, accentFilter]);

  const fetchVoices = async (refresh = false) => {
    setLoading(true);
    try {
      const res = await api.get(`/voices?refresh=${refresh}&gender=${genderFilter}&search=${encodeURIComponent(search)}&accent=${accentFilter}`);
      if (res.voices) {
        setVoices(res.voices);
      }
      setConfigMissing(false);
    } catch (err) {
      if (err.code === 'CONFIG_REQUIRED' || err.code === 'INVALID_API_KEY' || err.status === 401 || err.message?.toLowerCase().includes('api key')) {
        setConfigMissing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('vf_favorite_voices', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVoices();
  };

  // Get distinct accents from current voices for the accent dropdown
  const distinctAccents = Array.from(new Set(voices.map(v => v.accent).filter(Boolean)));

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-[#3a5d61] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#DFD6AE] mb-1">
            <Volume2 className="w-3.5 h-3.5" />
            <span>NEURAL VOICE REPOSITORY</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Voice Discovery Library</h1>
        </div>

        <button
          onClick={() => fetchVoices(true)}
          className="px-3.5 py-1.5 rounded-lg border border-[#3a5d61] bg-[#21383b] hover:bg-[#2e4c50] text-xs font-mono text-[#dfd8bc] flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Provider</span>
        </button>
      </div>

      {configMissing && (
        <ConfigAlert
          provider="elevenlabs"
          message="ElevenLabs API key is required to load live voices. Please set ELEVENLABS_API_KEY in server/.env."
        />
      )}

      {/* SEARCH AND FILTERS BAR */}
      <div className="lattice-panel p-4 rounded-xl border border-[#DFD6AE]/20 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ab0b2]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search voice name, accent, tone..."
            className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg pl-9 pr-3 py-2 text-xs text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE] font-sans"
          />
        </form>

        {/* Gender Segmented Filter */}
        <div className="flex items-center space-x-1 bg-[#162729] p-1 rounded-lg border border-[#3a5d61] text-xs font-mono w-full md:w-auto">
          {['all', 'female', 'male'].map(g => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded capitalize transition-colors ${
                genderFilter === g ? 'bg-[#DFD6AE] text-black font-semibold' : 'text-[#b5ad8c] hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Accent Filter */}
        {distinctAccents.length > 0 && (
          <select
            value={accentFilter}
            onChange={(e) => setAccentFilter(e.target.value)}
            className="bg-[#162729] border border-[#3a5d61] rounded-lg px-3 py-2 text-xs font-mono text-[#dfd8bc] focus:outline-none focus:border-[#DFD6AE] w-full md:w-auto"
          >
            <option value="all">All Accents</option>
            {distinctAccents.map(acc => (
              <option key={acc} value={acc}>{acc}</option>
            ))}
          </select>
        )}
      </div>

      {/* VOICES GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="lattice-panel p-5 rounded-xl border border-[#3a5d61] animate-pulse h-36" />
          ))}
        </div>
      ) : voices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {voices.map(v => (
            <VoiceCard
              key={v.id}
              voice={v}
              isFavorite={favorites.includes(v.id)}
              onToggleFavorite={toggleFavorite}
              onSelect={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className="lattice-panel p-12 rounded-2xl border border-[#3a5d61] text-center space-y-3">
          <Volume2 className="w-8 h-8 text-[#7c9496] mx-auto" />
          <h3 className="text-sm font-semibold text-[#dfd8bc]">No matching voices found</h3>
          <p className="text-xs text-[#9ab0b2]">Try modifying your search or filter parameters.</p>
        </div>
      )}
    </div>
  );
};

