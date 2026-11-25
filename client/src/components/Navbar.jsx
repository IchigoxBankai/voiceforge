import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mic, Waves, AudioWaveform, User, LogOut, ChevronRight, Menu, X, Sparkles, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({ elevenlabs: false, openai: false });

  useEffect(() => {
    api.get('/status')
      .then(res => {
        if (res?.status) {
          setApiStatus({
            elevenlabs: res.status.elevenlabs?.configured ?? false,
            openai: res.status.openai?.configured ?? false
          });
        }
      })
      .catch(() => {});
  }, []);

  const isPublicPage = ['/', '/login', '/register', '/forgot-password', '/privacy', '/terms'].includes(location.pathname);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#1b3033]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[#DFD6AE]/20 to-[#3a5d61]/30 border border-[#DFD6AE]/30 group-hover:border-[#DFD6AE] transition-all duration-300">
              <AudioWaveform className="w-5 h-5 text-[#DFD6AE] group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-[#DFD6AE]/20 blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#F5F0DC] font-serif flex items-center gap-1">
                Voice<span className="text-[#DFD6AE] italic">Forge</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2e4c50] text-[#DFD6AE] ml-1.5 border border-[#497176]/60 not-italic tracking-wider">
                  LATTICE
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
            {user ? (
              <>
                <Link
                  to="/tts"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    location.pathname === '/tts'
                      ? 'text-[#DFD6AE] bg-[#274245]/70 border border-[#DFD6AE]/30'
                      : 'text-[#b5ad8c] hover:text-white hover:bg-[#2e4c50]/50'
                  }`}
                >
                  Text to Speech
                </Link>
                <Link
                  to="/translation"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    location.pathname === '/translation'
                      ? 'text-[#DFD6AE] bg-[#274245]/70 border border-[#DFD6AE]/30'
                      : 'text-[#b5ad8c] hover:text-white hover:bg-[#2e4c50]/50'
                  }`}
                >
                  Speech Translator
                </Link>
                <Link
                  to="/voices"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    location.pathname === '/voices'
                      ? 'text-[#DFD6AE] bg-[#274245]/70 border border-[#DFD6AE]/30'
                      : 'text-[#b5ad8c] hover:text-white hover:bg-[#2e4c50]/50'
                  }`}
                >
                  Voice Library
                </Link>
                <Link
                  to="/projects"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    location.pathname === '/projects'
                      ? 'text-[#DFD6AE] bg-[#274245]/70 border border-[#DFD6AE]/30'
                      : 'text-[#b5ad8c] hover:text-white hover:bg-[#2e4c50]/50'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  to="/history"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    location.pathname === '/history'
                      ? 'text-[#DFD6AE] bg-[#274245]/70 border border-[#DFD6AE]/30'
                      : 'text-[#b5ad8c] hover:text-white hover:bg-[#2e4c50]/50'
                  }`}
                >
                  History
                </Link>
              </>
            ) : (
              <>
                <a href="#features" className="px-3 py-1.5 text-[#b5ad8c] hover:text-white transition-colors">
                  Features
                </a>
                <a href="#voices" className="px-3 py-1.5 text-[#b5ad8c] hover:text-white transition-colors">
                  Voice Engine
                </a>
                <a href="#translation" className="px-3 py-1.5 text-[#b5ad8c] hover:text-white transition-colors">
                  Translation
                </a>
                <a href="#pricing" className="px-3 py-1.5 text-[#b5ad8c] hover:text-white transition-colors">
                  Pricing
                </a>
              </>
            )}
          </div>

          {/* Right Action / Auth Button */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Live Provider Status Pill */}
            <div className="hidden lg:flex items-center space-x-2 text-xs font-mono px-2.5 py-1 rounded-full bg-[#21383b] border border-[#3a5d61]">
              <span className={`w-2 h-2 rounded-full ${apiStatus.elevenlabs && apiStatus.openai ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[#b5ad8c]">
                {apiStatus.elevenlabs && apiStatus.openai ? 'AI ONLINE' : 'CONFIG CHECK'}
              </span>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-[#3a5d61] bg-[#21383b]/60 hover:bg-[#2e4c50]/80 text-sm text-[#dfd8bc] hover:text-white transition-colors"
                >
                  <User className="w-4 h-4 text-[#DFD6AE]" />
                  <span className="max-w-[120px] truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    navigate('/');
                  }}
                  className="p-2 rounded-lg border border-[#3a5d61] text-[#b5ad8c] hover:text-red-400 hover:border-red-950/60 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-[#dfd8bc] hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="relative group px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#DFD6AE] to-[#cbbd8b] text-sm font-medium text-black hover:opacity-95 transition-all shadow-[0_0_20px_rgba(223,214,174,0.3)]"
                >
                  <span className="relative z-10 font-semibold flex items-center gap-1">
                    Get Started <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#b5ad8c] hover:text-white hover:bg-[#2e4c50]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#3a5d61] bg-[#1f3639] px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded text-[#dfd8bc] hover:bg-[#2e4c50]">Dashboard</Link>
              <Link to="/tts" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded text-[#dfd8bc] hover:bg-[#2e4c50]">Text to Speech</Link>
              <Link to="/translation" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded text-[#dfd8bc] hover:bg-[#2e4c50]">Speech Translator</Link>
              <Link to="/voices" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded text-[#dfd8bc] hover:bg-[#2e4c50]">Voice Library</Link>
              <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded text-[#dfd8bc] hover:bg-[#2e4c50]">My Projects</Link>
              <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded text-[#dfd8bc] hover:bg-[#2e4c50]">Audio History</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded text-[#dfd8bc] hover:bg-[#2e4c50]">Profile & Settings</Link>
              <button
                onClick={() => { signOut(); setMobileMenuOpen(false); navigate('/'); }}
                className="w-full text-left px-3 py-2 text-red-400 hover:bg-[#2e4c50] rounded"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded text-[#dfd8bc] hover:bg-[#2e4c50]">Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded bg-[#DFD6AE] text-black font-semibold text-center">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

