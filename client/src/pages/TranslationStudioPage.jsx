import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Mic, MicOff, Upload, Play, Pause, ArrowRight, RotateCcw, 
  CheckCircle2, AlertCircle, FileAudio, Edit3, Volume2, Download, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { AudioPlayer } from '../components/AudioPlayer';
import { ConfigAlert } from '../components/ConfigAlert';
import { VoiceCard } from '../components/VoiceCard';

export const TranslationStudioPage = () => {
  // Mode: 'upload' or 'record'
  const [inputMode, setInputMode] = useState('upload');

  // File Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Recording state (MediaRecorder)
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Settings
  const [languages, setLanguages] = useState([]);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('es');

  // Voices
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [genderFilter, setGenderFilter] = useState('all');

  // Pipeline stages: 'idle' | 'transcribing' | 'translating' | 'editing' | 'synthesizing' | 'completed'
  const [stage, setStage] = useState('idle');
  const [error, setError] = useState(null);
  const [missingConfig, setMissingConfig] = useState(null); // 'openai' or 'elevenlabs'

  // Transcripts
  const [sourceTranscript, setSourceTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [sourceAudioUrl, setSourceAudioUrl] = useState('');
  const [sourceAudioFileId, setSourceAudioFileId] = useState(null);
  const [translatedTranscript, setTranslatedTranscript] = useState('');
  const [finalProject, setFinalProject] = useState(null);

  useEffect(() => {
    // 1. Get languages
    api.get('/languages').then(res => {
      if (res.languages) setLanguages(res.languages);
    }).catch(console.warn);

    // 2. Get voices
    api.get(`/voices?gender=${genderFilter}`).then(res => {
      if (res.voices) {
        setVoices(res.voices);
        if (res.voices.length > 0) setSelectedVoice(res.voices[0]);
      }
    }).catch(err => {
      if (err.code === 'CONFIG_REQUIRED' || err.code === 'INVALID_API_KEY' || err.status === 401 || err.message?.toLowerCase().includes('api key')) {
        setMissingConfig('elevenlabs');
      }
    });
  }, [genderFilter]);

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac', '.aac'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      return setError('Invalid file format. Please upload an MP3, WAV, M4A, WEBM, or FLAC file.');
    }
    if (file.size > 25 * 1024 * 1024) {
      return setError('File size exceeds the 25MB limit.');
    }
    setError(null);
    setSelectedFile(file);
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(URL.createObjectURL(file));
  };

  // MediaRecorder API implementation
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        setRecordedAudioUrl(URL.createObjectURL(audioBlob));
        setSelectedFile(new File([audioBlob], `mic_recording_${Date.now()}.webm`, { type: 'audio/webm' }));
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError(`Microphone access error: ${err.message}. Please allow microphone permissions.`);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    }
  };

  const formatSecs = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // STEP 1 & 2: TRANSCRIBE
  const handleStartPipeline = async () => {
    if (!selectedFile) {
      return setError('Please upload an audio file or record speech first.');
    }

    setError(null);
    setStage('transcribing');

    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);
      if (sourceLanguage !== 'auto') {
        formData.append('language', sourceLanguage);
      }

      // Step 2: OpenAI Whisper Transcription
      const transcribeRes = await api.post('/translation/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSourceTranscript(transcribeRes.transcript || '');
      setDetectedLanguage(transcribeRes.detectedLanguage || 'en');
      setSourceAudioUrl(transcribeRes.sourceAudioUrl);
      setSourceAudioFileId(transcribeRes.sourceAudioFileId);

      // Step 4: OpenAI GPT-4o-mini Translation
      setStage('translating');
      const targetLangName = languages.find(l => l.code === targetLanguage)?.name || targetLanguage;
      const translateRes = await api.post('/translation/translate-text', {
        text: transcribeRes.transcript,
        targetLanguage: targetLangName,
        sourceLanguage: transcribeRes.detectedLanguage
      });

      setTranslatedTranscript(translateRes.translatedText);
      setStage('editing'); // User reviews and edits before synthesis
    } catch (err) {
      if (err.code === 'CONFIG_REQUIRED') {
        setMissingConfig(err.provider || 'openai');
      } else {
        setError(err.message || 'Speech transcription or translation failed.');
      }
      setStage('idle');
    }
  };

  // STEP 7: SYNTHESIZE TRANSLATED AUDIO
  const handleSynthesizeTranslatedSpeech = async () => {
    if (!translatedTranscript.trim()) {
      return setError('Translated transcript is empty.');
    }
    if (!selectedVoice) {
      return setError('Please select an output voice.');
    }

    setError(null);
    setStage('synthesizing');

    try {
      const payload = {
        sourceAudioUrl,
        sourceAudioFileId,
        detectedLanguage,
        sourceTranscript,
        targetLanguage,
        translatedTranscript,
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        modelId: 'eleven_multilingual_v2',
        voiceSettings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      };

      const res = await api.post('/translation/create', payload);
      if (res.project) {
        setFinalProject(res.project);
        setStage('completed');
      }
    } catch (err) {
      if (err.code === 'CONFIG_REQUIRED') {
        setMissingConfig('elevenlabs');
      } else {
        setError(err.message || 'Speech synthesis of translated audio failed.');
      }
      setStage('editing');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Studio Header */}
      <div className="border-b border-[#3a5d61] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#DFD6AE] mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>CROSS-LINGUAL SPEECH TRANSLATION STUDIO</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audio Translation & Re-Synthesis</h1>
        </div>

        {/* Progress Pipeline Pill */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-[#9ab0b2]">STAGE:</span>
          <span className="text-[#DFD6AE] uppercase font-semibold">{stage}</span>
        </div>
      </div>

      {missingConfig && (
        <ConfigAlert
          provider={missingConfig}
          message={`Configure ${missingConfig === 'openai' ? 'OPENAI_API_KEY for Whisper & GPT-4o' : 'ELEVENLABS_API_KEY for speech synthesis'} in server/.env to run live translation.`}
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

      {/* STAGE 1: INGESTION (UPLOAD OR RECORD) */}
      {stage === 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Input Method Tabs */}
            <div className="flex items-center space-x-2 bg-[#21383b]/60 p-1.5 rounded-xl border border-[#3a5d61] font-mono text-xs max-w-sm">
              <button
                onClick={() => setInputMode('upload')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  inputMode === 'upload' ? 'bg-[#DFD6AE] text-black font-semibold' : 'text-[#b5ad8c] hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Audio</span>
              </button>
              <button
                onClick={() => setInputMode('record')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  inputMode === 'record' ? 'bg-[#DFD6AE] text-black font-semibold' : 'text-[#b5ad8c] hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Record Mic</span>
              </button>
            </div>

            {/* Upload Area */}
            {inputMode === 'upload' ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`lattice-panel p-10 rounded-2xl border-2 border-dashed text-center transition-all ${
                  dragActive ? 'border-[#DFD6AE] bg-[#274245]/50' : 'border-[#3a5d61] hover:border-[#497176]'
                }`}
              >
                <Upload className="w-10 h-10 text-[#DFD6AE] mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-white">Drag and drop audio file</h3>
                <p className="text-xs text-[#b5ad8c] mt-1">Supports MP3, WAV, M4A, WEBM, FLAC up to 25MB</p>

                <div className="mt-6">
                  <label className="px-4 py-2 rounded-lg bg-[#2e4c50] hover:bg-[#385c61] text-[#eae4cb] text-xs font-mono cursor-pointer border border-[#497176] inline-block transition-colors">
                    Browse Files
                    <input
                      type="file"
                      accept=".mp3,.wav,.m4a,.webm,.ogg,.flac,.aac"
                      onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-6 p-3 rounded-lg bg-[#21383b] border border-[#3a5d61] text-left flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileAudio className="w-4 h-4 text-[#DFD6AE]" />
                      <span className="text-xs text-white font-medium">{selectedFile.name}</span>
                    </div>
                    <span className="text-xs font-mono text-[#9ab0b2]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                )}
              </div>
            ) : (
              /* MediaRecorder Record Area */
              <div className="lattice-panel p-10 rounded-2xl border border-[#3a5d61] text-center space-y-6">
                <div className="relative inline-block">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all ${
                    isRecording
                      ? 'bg-red-950/60 border-red-500 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse'
                      : 'bg-[#21383b] border-[#3a5d61] text-[#b5ad8c]'
                  }`}>
                    <Mic className="w-8 h-8" />
                  </div>
                </div>

                <div className="font-mono text-2xl font-bold text-white tracking-widest">
                  {formatSecs(recordingDuration)}
                </div>

                <div className="flex items-center justify-center space-x-3">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-mono text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <>
                      {isPaused ? (
                        <button
                          onClick={resumeRecording}
                          className="px-4 py-2 rounded-lg bg-[#2e4c50] text-[#eae4cb] text-xs font-mono"
                        >
                          Resume
                        </button>
                      ) : (
                        <button
                          onClick={pauseRecording}
                          className="px-4 py-2 rounded-lg bg-[#2e4c50] text-[#eae4cb] text-xs font-mono"
                        >
                          Pause
                        </button>
                      )}
                      <button
                        onClick={stopRecording}
                        className="px-5 py-2.5 rounded-lg bg-zinc-200 hover:bg-white text-black font-mono text-xs font-bold"
                      >
                        Stop Recording
                      </button>
                    </>
                  )}
                </div>

                {recordedAudioUrl && !isRecording && (
                  <div className="pt-4 border-t border-[#3a5d61]">
                    <p className="text-xs font-mono text-[#b5ad8c] mb-2">Recorded Audio Playback</p>
                    <audio controls src={recordedAudioUrl} className="w-full max-w-md mx-auto" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Translation Parameters (Right) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="lattice-panel p-5 rounded-2xl border border-[#DFD6AE]/20 space-y-4">
              <h3 className="text-xs font-mono uppercase text-[#dfd8bc] font-semibold tracking-wider">
                Language Pipeline Settings
              </h3>

              {/* Source Lang */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-[#b5ad8c]">Original Language</label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg px-3 py-2 text-xs font-mono text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE]"
                >
                  <option value="auto">✨ Automatic Language Detection</option>
                  {languages.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>

              {/* Target Lang */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-[#b5ad8c]">Target Language</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg px-3 py-2 text-xs font-mono text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE]"
                >
                  {languages.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name} ({l.native})</option>
                  ))}
                </select>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartPipeline}
                disabled={!selectedFile}
                className="w-full mt-4 py-3.5 rounded-xl bg-[#DFD6AE] hover:bg-[#ebe4c5] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(223,214,174,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>Transcribe & Translate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: PROCESSING (TRANSCRIBING OR TRANSLATING) */}
      {(stage === 'transcribing' || stage === 'translating') && (
        <div className="lattice-panel p-16 rounded-2xl border border-[#DFD6AE]/30 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 border-4 border-[#DFD6AE] border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white font-mono uppercase">
            {stage === 'transcribing' ? 'Transcribing via Whisper-1...' : 'Translating to Target Language...'}
          </h3>
          <p className="text-xs text-[#b5ad8c]">
            {stage === 'transcribing'
              ? 'Extracting accurate linguistic phonemes and speech segments.'
              : 'Translating text with GPT-4o-mini preserving nuance and paragraph flow.'}
          </p>
        </div>
      )}

      {/* STAGE 3: EDITING & REVIEW DUAL PANELS */}
      {(stage === 'editing' || stage === 'synthesizing' || stage === 'completed') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel: Original Transcript */}
            <div className="lattice-panel p-5 rounded-2xl border border-[#3a5d61] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#b5ad8c] border-b border-[#3a5d61] pb-2">
                <span className="uppercase text-[#DFD6AE] font-semibold">ORIGINAL TRANSCRIPT</span>
                <span>Detected: {detectedLanguage.toUpperCase()}</span>
              </div>
              <div className="p-3 bg-[#162729]/80 rounded-xl border border-[#274245] text-sm text-[#dfd8bc] min-h-[140px] max-h-[220px] overflow-y-auto leading-relaxed">
                {sourceTranscript}
              </div>
              {sourceAudioUrl && (
                <div className="pt-2">
                  <p className="text-[11px] font-mono text-[#9ab0b2] mb-1">Source Audio Recording</p>
                  <audio controls src={sourceAudioUrl} className="w-full h-8" />
                </div>
              )}
            </div>

            {/* Right Panel: Editable Translated Transcript */}
            <div className="lattice-panel p-5 rounded-2xl border border-[#DFD6AE]/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#DFD6AE] border-b border-[#3a5d61] pb-2">
                <span className="uppercase font-semibold flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>EDITABLE TRANSLATED TEXT</span>
                </span>
                <span>Target: {targetLanguage.toUpperCase()}</span>
              </div>

              <textarea
                rows={6}
                value={translatedTranscript}
                onChange={(e) => setTranslatedTranscript(e.target.value)}
                className="w-full bg-[#162729]/90 border border-[#3a5d61] rounded-xl p-3 text-sm text-[#f5f0dc] focus:outline-none focus:border-[#DFD6AE] leading-relaxed font-sans"
              />
              <p className="text-[11px] text-[#9ab0b2] font-mono">
                Verify and edit wording before generating spoken translation audio.
              </p>
            </div>
          </div>

          {/* Voice Selection & Synthesis Action */}
          <div className="lattice-panel p-6 rounded-2xl border border-[#DFD6AE]/20 space-y-6">
            <div className="flex items-center justify-between border-b border-[#3a5d61] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Choose Target Synthesis Voice</h3>
                <p className="text-xs text-[#b5ad8c]">Select an ElevenLabs voice to vocalize the translated transcript.</p>
              </div>

              {/* Gender Filter */}
              <div className="flex items-center space-x-1 bg-[#162729] p-1 rounded-lg border border-[#3a5d61] font-mono text-xs">
                {['all', 'female', 'male'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenderFilter(g)}
                    className={`px-3 py-1 rounded capitalize transition-colors ${
                      genderFilter === g ? 'bg-[#DFD6AE] text-black font-semibold' : 'text-[#b5ad8c]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Cards Slider / Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
              {voices.map(v => (
                <VoiceCard
                  key={v.id}
                  voice={v}
                  isSelected={selectedVoice?.id === v.id}
                  onSelect={(v) => setSelectedVoice(v)}
                />
              ))}
            </div>

            {/* Synthesize Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setStage('idle')}
                className="px-4 py-2.5 rounded-lg border border-[#3a5d61] text-xs font-mono text-[#b5ad8c] hover:text-white"
              >
                Reset Translation
              </button>

              <button
                onClick={handleSynthesizeTranslatedSpeech}
                disabled={stage === 'synthesizing' || !selectedVoice}
                className="px-8 py-3 rounded-xl bg-[#DFD6AE] hover:bg-[#ebe4c5] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(223,214,174,0.3)] disabled:opacity-50 flex items-center gap-2"
              >
                {stage === 'synthesizing' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Rendering Voice...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Synthesize Translated Audio</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Final Completed Comparison Player */}
          {stage === 'completed' && finalProject && (
            <div className="lattice-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Translation Project Successfully Synthesized</span>
              </div>

              <AudioPlayer
                audioUrl={finalProject.outputAudioUrl}
                title={`Translated (${finalProject.targetLanguage.toUpperCase()}) - ${finalProject.voiceName}`}
                duration={finalProject.durationSeconds}
                onRegenerate={handleSynthesizeTranslatedSpeech}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

