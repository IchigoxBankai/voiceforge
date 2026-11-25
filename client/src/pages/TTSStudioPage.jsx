import React, { useState, useEffect } from 'react';
import { 
  AudioWaveform, Sparkles, Play, Sliders, Volume2, 
  RotateCcw, Check, AlertCircle, Copy, Trash2, Filter
} from 'lucide-react';
import { api } from '../services/api';
import { AudioPlayer } from '../components/AudioPlayer';
import { ConfigAlert } from '../components/ConfigAlert';
import { VoiceCard } from '../components/VoiceCard';

export const TTSStudioPage = () => {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('eleven_multilingual_v2');
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Filters
  const [genderFilter, setGenderFilter] = useState('all'); // all, male, female
  const [searchFilter, setSearchFilter] = useState('');
  const [accentFilter, setAccentFilter] = useState('all');

  // Sliders
  const [stability, setStability] = useState(0.5);
  const [similarity, setSimilarity] = useState(0.75);
  const [style, setStyle] = useState(0.0);
  const [speakerBoost, setSpeakerBoost] = useState(true);
  const [speed, setSpeed] = useState(1.0);

  // Status
  const [generating, setGenerating] = useState(false);
  const [resultGeneration, setResultGeneration] = useState(null);
  const [error, setError] = useState(null);
  const [configMissing, setConfigMissing] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(true);

  // Fetch languages, models & voices on mount
  useEffect(() => {
    // 1. Get languages & models
    api.get('/languages')
      .then(res => {
        if (res.languages) setLanguages(res.languages);
        if (res.models) setModels(res.models);
      })
      .catch(console.warn);

    // 2. Get voices
    fetchVoices();
  }, []);

  const fetchVoices = async (gender = genderFilter) => {
    setLoadingVoices(true);
    try {
      const res = await api.get(`/voices?gender=${gender}&search=${encodeURIComponent(searchFilter)}&accent=${accentFilter}`);
      if (res.voices) {
        setVoices(res.voices);
        if (!selectedVoice && res.voices.length > 0) {
          setSelectedVoice(res.voices[0]);
        }
      }
      setConfigMissing(false);
    } catch (err) {
      if (err.code === 'CONFIG_REQUIRED' || err.code === 'INVALID_API_KEY' || err.status === 401 || err.message?.toLowerCase().includes('api key')) {
        setConfigMissing(true);
        setError(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoadingVoices(false);
    }
  };

  const handleGenderChange = (gender) => {
    setGenderFilter(gender);
    fetchVoices(gender);
  };

  const currentModelMeta = models.find(m => m.id === selectedModel) || {
    maxCharacters: 10000,
    languages: ['en']
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      return setError('Please enter some text to synthesize.');
    }
    if (!selectedVoice) {
      return setError('Please select a voice from the library.');
    }

    setError(null);
    setGenerating(true);

    try {
      const payload = {
        text,
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        modelId: selectedModel,
        language: selectedLanguage,
        voiceSettings: {
          stability,
          similarity_boost: similarity,
          style,
          speakerBoost,
          speed
        }
      };

      const res = await api.post('/speech/generate', payload);
      if (res.generation) {
        setResultGeneration(res.generation);
      }
    } catch (err) {
      if (err.code === 'CONFIG_REQUIRED') {
        setConfigMissing(true);
      } else {
        setError(err.message || 'Speech generation failed.');
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Studio Header */}
      <div className="border-b border-[#3a5d61] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#DFD6AE] mb-1">
            <AudioWaveform className="w-3.5 h-3.5" />
            <span>NEURAL TEXT-TO-SPEECH STUDIO</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Speech Synthesis Workspace</h1>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-[#9ab0b2]">ENGINE:</span>
          <span className="text-[#DFD6AE] font-semibold">ELEVENLABS API v1</span>
        </div>
      </div>

      {configMissing && (
        <ConfigAlert
          provider="elevenlabs"
          message="ElevenLabs API key is missing. Set ELEVENLABS_API_KEY in server/.env to synthesize live speech."
        />
      )}

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-[#9ab0b2] hover:text-[#dfd8bc] font-mono">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: TEXT EDITOR & SETTINGS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Text Editor Box */}
          <div className="lattice-panel p-5 rounded-2xl border border-[#DFD6AE]/20 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#b5ad8c]">
              <span className="uppercase tracking-wider">Source Script</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setText('')}
                  className="hover:text-red-400 transition-colors flex items-center gap-1"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter or paste the script you want to synthesize into human speech..."
              maxLength={currentModelMeta.maxCharacters}
              className="w-full bg-[#162729]/90 border border-[#3a5d61] rounded-xl p-4 text-sm text-[#f5f0dc] placeholder-[#7c9496] focus:outline-none focus:border-[#DFD6AE] focus:ring-1 focus:ring-[#DFD6AE] resize-none font-sans leading-relaxed"
            />

            <div className="flex items-center justify-between text-xs font-mono text-[#9ab0b2] pt-1">
              <span>{text.length} / {currentModelMeta.maxCharacters.toLocaleString()} characters</span>
              <span className={text.length > currentModelMeta.maxCharacters * 0.9 ? 'text-amber-400' : 'text-[#9ab0b2]'}>
                {Math.max(0, currentModelMeta.maxCharacters - text.length)} remaining
              </span>
            </div>
          </div>

          {/* Model & Language Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Model Selector */}
            <div className="lattice-panel p-4 rounded-xl border border-[#3a5d61] space-y-2">
              <label className="block text-xs font-mono uppercase text-[#b5ad8c]">
                Synthesis Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg px-3 py-2 text-xs font-mono text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE]"
              >
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="lattice-panel p-4 rounded-xl border border-[#3a5d61] space-y-2">
              <label className="block text-xs font-mono uppercase text-[#b5ad8c]">
                Spoken Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg px-3 py-2 text-xs font-mono text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE]"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.name} ({l.native})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Voice Tuning Parameters (Sliders) */}
          <div className="lattice-panel p-5 rounded-2xl border border-[#DFD6AE]/20 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#DFD6AE] font-semibold border-b border-[#3a5d61] pb-2">
              <Sliders className="w-4 h-4" />
              <span>VOICE TUNING PARAMETERS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Stability */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-[#dfd8bc]">
                  <span>Stability</span>
                  <span className="text-[#DFD6AE]">{stability.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={stability}
                  onChange={(e) => setStability(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2e4c50] accent-[#DFD6AE] rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#7c9496] font-mono">
                  <span>Variable / Expressive</span>
                  <span>Steady / Monotone</span>
                </div>
              </div>

              {/* Similarity Boost */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-[#dfd8bc]">
                  <span>Clarity & Similarity</span>
                  <span className="text-[#DFD6AE]">{similarity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={similarity}
                  onChange={(e) => setSimilarity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2e4c50] accent-[#DFD6AE] rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#7c9496] font-mono">
                  <span>Low</span>
                  <span>High Similarity</span>
                </div>
              </div>

              {/* Style Exaggeration (for v2 models) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-[#dfd8bc]">
                  <span>Style Exaggeration</span>
                  <span className="text-[#DFD6AE]">{style.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={style}
                  onChange={(e) => setStyle(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2e4c50] accent-[#DFD6AE] rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#7c9496] font-mono">
                  <span>Neutral</span>
                  <span>Exaggerated</span>
                </div>
              </div>

              {/* Speaking Speed */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-[#dfd8bc]">
                  <span>Speaking Speed</span>
                  <span className="text-[#DFD6AE]">{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2e4c50] accent-[#DFD6AE] rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#7c9496] font-mono">
                  <span>0.5x Slower</span>
                  <span>2.0x Faster</span>
                </div>
              </div>
            </div>

            {/* Speaker Boost Toggle */}
            <div className="pt-2 border-t border-[#3a5d61] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#dfd8bc]">Speaker Boost</span>
                <p className="text-[11px] text-[#9ab0b2]">Boost similarity to the original speaker's profile.</p>
              </div>
              <button
                onClick={() => setSpeakerBoost(!speakerBoost)}
                className={`w-11 h-6 rounded-full transition-colors relative ${speakerBoost ? 'bg-[#DFD6AE]' : 'bg-[#2e4c50]'}`}
              >
                <span className={`block w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${speakerBoost ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Action Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !text.trim() || !selectedVoice}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#DFD6AE] via-[#ebe4c5] to-[#cbbd8b] hover:from-[#ebe4c5] hover:to-[#DFD6AE] text-black font-mono font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(223,214,174,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>SYNTHESIZING NEURAL AUDIO...</span>
              </>
            ) : (
              <>
                <AudioWaveform className="w-5 h-5" />
                <span>GENERATE SPEECH // ELEVENLABS</span>
              </>
            )}
          </button>

          {/* Result Player */}
          {resultGeneration && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-mono uppercase text-[#DFD6AE] font-semibold tracking-wider">
                Generated Audio Result
              </h3>
              <AudioPlayer
                audioUrl={resultGeneration.audio_url}
                title={`${resultGeneration.voice_name || 'Speech'} (${resultGeneration.characters_count} chars)`}
                duration={resultGeneration.duration_seconds}
                onRegenerate={handleGenerate}
              />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: VOICE SELECTION (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="lattice-panel p-4 rounded-2xl border border-[#DFD6AE]/20 space-y-3">
            <div className="flex items-center justify-between border-b border-[#3a5d61] pb-2">
              <h3 className="text-xs font-mono uppercase text-[#dfd8bc] font-semibold tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#DFD6AE]" />
                <span>Voice Selection</span>
              </h3>
              <span className="text-xs font-mono text-[#9ab0b2]">{voices.length} Available</span>
            </div>

            {/* Gender Filters */}
            <div className="flex items-center space-x-1.5 bg-[#162729] p-1 rounded-lg border border-[#3a5d61] font-mono text-xs">
              {['all', 'female', 'male'].map((g) => (
                <button
                  key={g}
                  onClick={() => handleGenderChange(g)}
                  className={`flex-1 py-1 rounded text-center capitalize transition-colors ${
                    genderFilter === g
                      ? 'bg-[#DFD6AE] text-black font-semibold'
                      : 'text-[#b5ad8c] hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Voice Cards List */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {loadingVoices ? (
                <div className="p-8 text-center text-xs font-mono text-[#9ab0b2]">
                  Loading voices from ElevenLabs...
                </div>
              ) : voices.length > 0 ? (
                voices.map((v) => (
                  <VoiceCard
                    key={v.id}
                    voice={v}
                    isSelected={selectedVoice?.id === v.id}
                    onSelect={(voice) => setSelectedVoice(voice)}
                  />
                ))
              ) : configMissing ? (
                <div className="p-8 text-center space-y-3 border border-amber-500/30 rounded-xl bg-amber-950/20">
                  <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                  <div className="text-xs font-mono font-bold text-amber-300">ElevenLabs API Key Required</div>
                  <p className="text-[11px] text-[#b5ad8c] leading-relaxed max-w-xs mx-auto">
                    Set a valid <code className="text-[#DFD6AE] font-mono">ELEVENLABS_API_KEY</code> in <code className="text-[#dfd8bc] font-mono">server/.env</code> to load live voices from your ElevenLabs account.
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[#9ab0b2]">
                  No voices found matching criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

