import React from 'react';
import { AlertCircle, Key, ExternalLink } from 'lucide-react';

export const ConfigAlert = ({
  provider = 'elevenlabs',
  message,
  onDismiss = null
}) => {
  const isEleven = provider === 'elevenlabs';
  const title = isEleven ? 'ElevenLabs API Key Required' : 'OpenAI API Key Required';
  const envKey = isEleven ? 'ELEVENLABS_API_KEY' : 'OPENAI_API_KEY';
  const portalUrl = isEleven ? 'https://elevenlabs.io/' : 'https://platform.openai.com/api-keys';

  return (
    <div className="lattice-panel rounded-xl p-4 border border-amber-500/30 bg-amber-950/20 my-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-semibold text-amber-300 font-mono">{title}</h4>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/50">
              CONFIG_REQUIRED
            </span>
          </div>

          <p className="mt-1 text-xs text-[#dfd8bc] leading-relaxed">
            {message || `To enable actual live ${isEleven ? 'Text-to-Speech synthesis' : 'speech transcription and translation'}, configure your credentials.`}
          </p>

          <div className="mt-3 p-2.5 rounded bg-black/60 border border-[#3a5d61] font-mono text-xs text-[#dfd8bc] flex items-center justify-between">
            <div>
              <span className="text-[#9ab0b2]">server/.env: </span>
              <span className="text-[#DFD6AE]">{envKey}</span>=your_key_here
            </div>
            <a
              href={portalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-[#DFD6AE] hover:text-[#ebe4c5] hover:underline"
            >
              <span>Get Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

