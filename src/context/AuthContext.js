'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Global counts for notifications & messages badges
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setPendingInvitesCount(0);
      return;
    }

    const fetchCounts = async () => {
      // Messages Non Lus
      const { count: msgs } = await supabase.from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .neq('status', 'read');
      if (msgs !== null) setUnreadCount(msgs);

      // Invits en attente
      const { count: invites } = await supabase.from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('friend_id', user.id)
        .eq('status', 'pending');
      if (invites !== null) setPendingInvitesCount(invites);
    };

    fetchCounts();

    const channel = supabase.channel('global_counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, fetchCounts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships', filter: `friend_id=eq.${user.id}` }, fetchCounts)
      .subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [user]);

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data);
      } else {
        // Auto-create missing profile for Google Users
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;
        if (currentUser && currentUser.app_metadata?.provider === 'google') {
          const { data: newProfile } = await supabase.from('profiles').insert([{
            id: userId,
            email: currentUser.email,
            full_name: currentUser.user_metadata?.full_name || 'Voyageuse',
            avatar_url: currentUser.user_metadata?.avatar_url,
            role: 'traveler'
          }]).select().single();
          if (newProfile) setProfile(newProfile);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function signUp({ email, password, fullName, city }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, city },
      },
    });
    return { data, error };
  }

  async function verifyOtp({ email, token }) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });
    return { data, error };
  }

  async function resendOtp({ email }) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { data, error };
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
    }
    return { error };
  }

  async function createProfile(profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ id: user.id, email: user.email, ...profileData }])
      .select()
      .single();

    if (data) setProfile(data);
    return { data, error };
  }

  async function updateProfile(updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (data) setProfile(data);
    return { data, error };
  }

  async function uploadAvatar(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (error) return { url: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  }

  async function signInWithGoogle(redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/feed` : 'http://localhost:3000/feed') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo
      }
    });
    if (error) throw error;
    return data;
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    verifyOtp,
    resendOtp,
    signIn,
    signOut,
    createProfile,
    updateProfile,
    fetchAvatar: uploadAvatar, // Alias if needed
    fetchProfile,
    signInWithGoogle,
    unreadCount,
    pendingInvitesCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
