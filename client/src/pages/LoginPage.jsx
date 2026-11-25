import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AudioWaveform, ArrowRight, AlertCircle, Lock, Mail, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. If you have not created an account yet, sign up or continue as guest below.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    signInAsGuest();
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 lattice-panel rounded-2xl border border-[#DFD6AE]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#274245]/90 border border-[#DFD6AE]/30 text-[#DFD6AE] mb-3">
          <AudioWaveform className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to VoiceForge</h2>
        <p className="text-xs text-[#b5ad8c] mt-1">Access your voice models, translation studios, and audio library</p>
      </div>

      {/* Guest Mode Direct Access Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-3 px-4 rounded-xl border border-[#DFD6AE]/40 bg-gradient-to-r from-[#274245] via-[#1f3639] to-[#274245] hover:border-[#DFD6AE] text-[#ebe4c5] hover:text-white transition-all shadow-[0_0_20px_rgba(223,214,174,0.15)] flex items-center justify-between group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#DFD6AE]/20 flex items-center justify-center text-[#DFD6AE] group-hover:bg-[#DFD6AE] group-hover:text-black transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold font-mono tracking-wider">CONTINUE AS GUEST</div>
              <div className="text-[10px] text-[#b5ad8c]">Instant studio access with zero registration</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#DFD6AE] group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3a5d61]" />
          </div>
          <span className="relative px-3 bg-[#1f3639] text-[11px] font-mono text-[#9ab0b2] uppercase tracking-widest">
            or sign in with email
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl border border-red-500/30 bg-red-950/30 text-red-400 text-xs space-y-2">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <div className="pt-1 border-t border-red-900/40 text-[11px] text-[#dfd8bc]">
            Tip: You can click <strong>"Continue as Guest"</strong> above to enter immediately without email validation.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#b5ad8c] mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ab0b2]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@voiceforge.ai"
              className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE] font-sans"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#b5ad8c]">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-[#DFD6AE] hover:text-[#ebe4c5]">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ab0b2]" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE] font-sans"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-lg bg-[#DFD6AE] hover:bg-[#ebe4c5] text-black font-semibold text-sm transition-all shadow-[0_0_20px_rgba(223,214,174,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In with Supabase'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-[#3a5d61] text-center text-xs text-[#b5ad8c]">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#DFD6AE] hover:text-[#ebe4c5] font-semibold">
          Create one now
        </Link>
      </div>
    </div>
  );
};
