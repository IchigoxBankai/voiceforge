import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());

  useEffect(() => {
    // Check if guest user session exists in local storage
    const savedGuest = localStorage.getItem('voiceforge_guest_user');
    if (savedGuest) {
      try {
        const parsedGuest = JSON.parse(savedGuest);
        setUser(parsedGuest);
        setLoading(false);
        return;
      } catch (_) {}
    }

    if (isSupabaseConfigured() && supabase) {
      // 1. Check active session from Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          setUser(session.user);
        }
        setIsDemoMode(false);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      // 2. Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) {
          setUser(session.user);
        } else {
          // If no supabase session, check guest
          const guest = localStorage.getItem('voiceforge_guest_user');
          if (guest) {
            try { setUser(JSON.parse(guest)); } catch (_) { setUser(null); }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Dev mode fallback
      const savedUser = localStorage.getItem('voiceforge_demo_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (_) {}
      }
      setIsDemoMode(true);
      setLoading(false);
    }
  }, []);

  const signInAsGuest = () => {
    const guestUser = {
      id: `guest_${Date.now()}`,
      email: 'guest@voiceforge.ai',
      isGuest: true,
      user_metadata: { full_name: 'Guest Creator' },
      created_at: new Date().toISOString()
    };
    localStorage.setItem('voiceforge_guest_user', JSON.stringify(guestUser));
    setUser(guestUser);
    return guestUser;
  };

  const signUp = async (email, password, fullName) => {
    localStorage.removeItem('voiceforge_guest_user');
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      if (error) throw error;
      if (data?.user) setUser(data.user);
      return data;
    } else {
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        user_metadata: { full_name: fullName || email.split('@')[0] },
        created_at: new Date().toISOString()
      };
      localStorage.setItem('voiceforge_demo_user', JSON.stringify(newUser));
      setUser(newUser);
      return { user: newUser };
    }
  };

  const signIn = async (email, password) => {
    localStorage.removeItem('voiceforge_guest_user');
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data?.user) setUser(data.user);
      return data;
    } else {
      const demoUser = {
        id: 'usr_demo_101',
        email,
        user_metadata: { full_name: email.split('@')[0] },
        created_at: new Date().toISOString()
      };
      localStorage.setItem('voiceforge_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      return { user: demoUser };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('voiceforge_guest_user');
    localStorage.removeItem('voiceforge_demo_user');
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      return data;
    }
    return { success: true };
  };

  const updateProfile = async ({ fullName, avatarUrl }) => {
    if (user?.isGuest) {
      const updated = {
        ...user,
        user_metadata: { ...user.user_metadata, full_name: fullName }
      };
      localStorage.setItem('voiceforge_guest_user', JSON.stringify(updated));
      setUser(updated);
      return { user: updated };
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url: avatarUrl }
      });
      if (error) throw error;
      setUser(data.user);
      return data;
    } else {
      const updated = {
        ...user,
        user_metadata: {
          ...user?.user_metadata,
          full_name: fullName || user?.user_metadata?.full_name
        }
      };
      localStorage.setItem('voiceforge_demo_user', JSON.stringify(updated));
      setUser(updated);
      return { user: updated };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isDemoMode,
      signInAsGuest,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
