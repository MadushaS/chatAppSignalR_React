// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      try {
        const sessionData = await authService.getCurrentSession();
        setSession(sessionData);
        setUser(sessionData?.user || null);
      } catch (error) {
        console.error("Session retrieval error:", error);
      } finally {
        setLoading(false);
      }
    }

    checkSession();

    // Listen for auth changes
    const {data} = authService.onAuthStateChanged(
      (event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );
  
    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  const refreshSession = async () => {
    try {
      const data = await authService.refreshSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const data = await authService.signIn(email, password);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, metadata) => {
    try {
      const data = await authService.signUp(email, password, metadata);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await authService.signOut();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    loading,
    session,
    signIn,
    signUp,
    signOut,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);