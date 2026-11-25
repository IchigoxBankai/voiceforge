import React, { useState } from 'react';
import { Play, Pause, Check, Star, Volume2 } from 'lucide-react';

export const VoiceCard = ({
  voice,
  isSelected = false,
  onSelect,
  isFavorite = false,
  onToggleFavorite
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioObj, setAudioObj] = useState(null);

  const togglePreview = (e) => {
    e.stopPropagation();
    if (!voice.previewUrl) return;

    if (isPlayingPreview && audioObj) {
      audioObj.pause();
      setIsPlayingPreview(false);
    } else {
      if (audioObj) {
        audioObj.play();
        setIsPlayingPreview(true);
      } else {
        const audio = new Audio(voice.previewUrl);
        audio.onended = () => setIsPlayingPreview(false);
        audio.onerror = () => setIsPlayingPreview(false);
        audio.play().then(() => {
          setAudioObj(audio);
          setIsPlayingPreview(true);
        }).catch(() => setIsPlayingPreview(false));
      }
    }
  };

  // Gender label styling from actual provider metadata
  const genderColor = voice.gender === 'female' 
    ? 'text-pink-400 bg-pink-950/40 border-pink-800/40' 
    : voice.gender === 'male' 
    ? 'text-blue-400 bg-blue-950/40 border-blue-800/40' 
    : 'text-[#b5ad8c] bg-[#21383b] border-[#3a5d61]';

  return (
    <div
      onClick={() => onSelect && onSelect(voice)}
      className={`relative group p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'bg-[#274245]/50 border-[#DFD6AE] shadow-[0_0_20px_rgba(223,214,174,0.15)] ring-1 ring-[#DFD6AE]'
          : 'bg-[#21383b]/60 border-[#3a5d61]/80 hover:border-[#497176] hover:bg-[#21383b]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2">
          {/* Voice Title and Badges */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <h4 className="font-semibold text-[#f5f0dc] text-sm group-hover:text-[#ebe4c5] transition-colors">
              {voice.name}
            </h4>

            {/* Gender Badge based on real provider metadata */}
            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${genderColor}`}>
              {voice.gender || 'Unspecified'}
            </span>

            {voice.accent && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#3a5d61] bg-[#21383b] text-[#b5ad8c]">
                {voice.accent}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-1.5 text-xs text-[#b5ad8c] line-clamp-2 leading-relaxed">
            {voice.description || 'Neural synthesis voice engineered for expressive articulation.'}
          </p>
        </div>

        {/* Favorite Icon */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(voice.id);
            }}
            className="text-[#9ab0b2] hover:text-amber-400 p-1"
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        )}
      </div>

      {/* Card Footer: Preview & Selection */}
      <div className="mt-4 pt-3 border-t border-[#3a5d61]/60 flex items-center justify-between">
        {voice.previewUrl ? (
          <button
            onClick={togglePreview}
            className={`flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1 rounded transition-colors ${
              isPlayingPreview
                ? 'bg-[#DFD6AE] text-black font-semibold'
                : 'text-[#dfd8bc] hover:text-white bg-[#2e4c50]/80 hover:bg-[#2e4c50]'
            }`}
          >
            {isPlayingPreview ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Playing</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Sample</span>
              </>
            )}
          </button>
        ) : (
          <span className="text-[11px] font-mono text-[#7c9496]">No Preview</span>
        )}

        <div className="flex items-center space-x-1">
          {isSelected && (
            <span className="flex items-center space-x-1 text-xs font-mono text-[#DFD6AE] font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Active</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

