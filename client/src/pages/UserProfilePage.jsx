import React, { useState } from 'react';
import { User, Lock, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const UserProfilePage = () => {
  const { user, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [speedPref, setSpeedPref] = useState('1.0');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await updateProfile({ fullName });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your VoiceForge account and all associated projects and audio assets? This action cannot be undone.')) {
      signOut();
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans">
      <div className="border-b border-[#3a5d61] pb-4">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#DFD6AE] mb-1">
          <User className="w-3.5 h-3.5" />
          <span>ACCOUNT IDENTIFIER & PREFERENCES</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">User Profile & Settings</h1>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile configuration saved successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-950/20 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="lattice-panel p-6 sm:p-8 rounded-2xl border border-[#DFD6AE]/20 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase text-[#b5ad8c] mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg px-3 py-2 text-xs text-[#f5f0dc] focus:outline-none focus:border-[#DFD6AE]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#b5ad8c] mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || 'developer@voiceforge.ai'}
              className="w-full bg-[#21383b] border border-[#3a5d61] rounded-lg px-3 py-2 text-xs text-[#9ab0b2] cursor-not-allowed font-mono"
            />
          </div>
        </div>

        {/* Audio Defaults */}
        <div className="pt-4 border-t border-[#3a5d61] space-y-4">
          <h3 className="text-xs font-mono uppercase text-[#DFD6AE] font-semibold tracking-wider">
            Audio Studio Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono text-[#b5ad8c] mb-1">Default Language</label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg px-3 py-2 text-xs font-mono text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE]"
              >
                <option value="en">English (US)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#b5ad8c] mb-1">Default Speaking Speed</label>
              <select
                value={speedPref}
                onChange={(e) => setSpeedPref(e.target.value)}
                className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg px-3 py-2 text-xs font-mono text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE]"
              >
                <option value="0.8">0.8x (Measured / Slow)</option>
                <option value="1.0">1.0x (Standard Conversational)</option>
                <option value="1.2">1.2x (Fast / Dynamic)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-[#DFD6AE] hover:bg-[#ebe4c5] text-black font-semibold text-xs font-mono transition-all shadow-[0_0_15px_rgba(223,214,174,0.3)] disabled:opacity-50"
        >
          {loading ? 'Saving Changes...' : 'Save Profile Settings'}
        </button>
      </form>

      {/* DANGER ZONE */}
      <div className="lattice-panel p-6 rounded-2xl border border-red-500/20 bg-red-950/10 space-y-4">
        <h3 className="text-xs font-mono uppercase text-red-400 font-semibold tracking-wider">
          Danger Zone
        </h3>
        <p className="text-xs text-[#b5ad8c]">
          Permanently delete your user profile, generation history, and uploaded voice assets.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 rounded-lg border border-red-800/80 hover:bg-red-950 text-red-400 text-xs font-mono flex items-center space-x-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Account</span>
        </button>
      </div>
    </div>
  );
};

