import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Download, RotateCcw, Volume2, VolumeX, FastForward } from 'lucide-react';

export const AudioPlayer = ({
  audioUrl,
  title = 'Generated Audio',
  duration: initialDuration = 0,
  onRegenerate = null,
  className = ''
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!audioUrl || downloading) return;
    setDownloading(true);
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'voiceforge_audio'}.mp3`;
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (_) {
      window.open(audioUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.warn('Audio playback prevented:', err));
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const changeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
    setSpeedMenuOpen(false);
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`lattice-panel p-4 rounded-xl border border-[#DFD6AE]/20 ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex flex-col space-y-3">
        {/* Title & Status */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[#DFD6AE] font-semibold">[OUTPUT]</span>
            <span className="text-[#eae4cb] font-medium truncate max-w-[200px] sm:max-w-xs">{title}</span>
          </div>

          <div className="flex items-center space-x-2 font-mono text-[#b5ad8c]">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration || initialDuration)}</span>
          </div>
        </div>

        {/* Waveform / Progress Slider */}
        <div className="relative flex items-center group py-1">
          <input
            type="range"
            min="0"
            max={duration || initialDuration || 100}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-[#2e4c50] rounded-lg appearance-none cursor-pointer accent-[#DFD6AE] group-hover:h-2 transition-all"
          />
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Play/Pause Main Button */}
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#DFD6AE] hover:bg-[#DFD6AE] text-black transition-all shadow-[0_0_15px_rgba(223,214,174,0.4)]"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                className="px-2.5 py-1.5 rounded bg-[#21383b] border border-[#3a5d61] text-xs font-mono text-[#dfd8bc] hover:text-white hover:border-[#497176]"
              >
                {speed}x
              </button>
              {speedMenuOpen && (
                <div className="absolute bottom-full mb-1 left-0 bg-[#21383b] border border-[#3a5d61] rounded-md py-1 shadow-xl z-20">
                  {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`block w-full text-left px-3 py-1 text-xs font-mono hover:bg-[#2e4c50] ${speed === s ? 'text-[#DFD6AE] font-bold' : 'text-[#dfd8bc]'}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Volume Slider */}
            <div className="hidden sm:flex items-center space-x-1.5">
              <button onClick={toggleMute} className="text-[#b5ad8c] hover:text-white">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-[#2e4c50] accent-[#DFD6AE] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-mono rounded bg-[#21383b] border border-[#3a5d61] text-[#dfd8bc] hover:text-white hover:border-[#497176]"
                title="Regenerate speech with current parameters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Regenerate</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold rounded-lg bg-[#DFD6AE] hover:bg-[#ebe4c5] text-[#1b3033] transition-colors disabled:opacity-60"
              title="Download MP3"
            >
              <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? 'Saving...' : 'Download MP3'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

