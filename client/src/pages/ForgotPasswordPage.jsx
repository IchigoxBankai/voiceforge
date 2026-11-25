import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AudioWaveform, ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 lattice-panel rounded-2xl border border-[#DFD6AE]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#274245]/90 border border-[#DFD6AE]/30 text-[#DFD6AE] mb-3">
          <AudioWaveform className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
        <p className="text-xs text-[#b5ad8c] mt-1">We will send a recovery link to your registered email address</p>
      </div>

      {submitted ? (
        <div className="text-center space-y-4">
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-sm">Reset Link Dispatched</p>
            <p className="mt-1 text-[#b5ad8c]">
              Check your inbox for <strong>{email}</strong> and follow the password recovery instructions.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center space-x-1 text-xs text-[#DFD6AE] hover:text-[#ebe4c5]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-950/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#b5ad8c] mb-1">
              Registered Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ab0b2]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-[#162729] border border-[#3a5d61] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#eae4cb] focus:outline-none focus:border-[#DFD6AE] font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#DFD6AE] hover:bg-[#ebe4c5] text-black font-semibold text-sm transition-all shadow-[0_0_20px_rgba(223,214,174,0.3)] disabled:opacity-50"
          >
            {loading ? 'Sending Link...' : 'Send Recovery Link'}
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center space-x-1 text-xs text-[#b5ad8c] hover:text-white">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

