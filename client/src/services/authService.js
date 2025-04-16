import { supabase } from './supabase';

export const authService = {
  getCurrentSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
  
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },
  
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    // Save metadata on profile table only if signUp is successful
    if (metadata && Object.keys(metadata).length > 0) {
      const { error: metadataError } = await supabase.from('profiles').insert(metadata);
      if (metadataError) throw metadataError;
    }
    return data;
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },
  
  refreshSession: async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  },
  
  onAuthStateChanged: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event,session);
    });
  }
};