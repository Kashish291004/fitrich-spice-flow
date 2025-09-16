import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'salesman';
  phone?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSalesman: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching
          setTimeout(async () => {
            try {
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

              if (error) {
                console.error('Error fetching profile:', error);
                toast({
                  title: "Profile Error",
                  description: "Failed to load user profile",
                  variant: "destructive",
                });
              } else {
                setProfile(profileData);
              }
            } catch (err) {
              console.error('Profile fetch error:', err);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signIn = async (username: string, password: string) => {
    try {
      setLoading(true);

      // Simple test credentials check (no Supabase calls)
      const testCredentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'salesman1', password: 'salesman123' },
        { username: 'salesman2', password: 'salesman123' },
        { username: 'manager', password: 'manager123' }, // treated as admin role for testing
      ];

      const isValidCredential = testCredentials.some(
        (cred) => cred.username === username && cred.password === password
      );

      if (!isValidCredential) {
        return { error: { message: 'Invalid username or password' } };
      }

      // Mock profiles (bypass DB for testing)
      const profileMap: Record<string, Profile> = {
        admin: {
          id: '11111111-1111-1111-1111-111111111111',
          user_id: '11111111-1111-1111-1111-111111111111',
          username: 'admin',
          full_name: 'Admin User',
          role: 'admin',
          phone: '+91 99999 00001',
          is_active: true,
        },
        salesman1: {
          id: '22222222-2222-2222-2222-222222222222',
          user_id: '22222222-2222-2222-2222-222222222222',
          username: 'salesman1',
          full_name: 'Raj Kumar',
          role: 'salesman',
          phone: '+91 99999 00002',
          is_active: true,
        },
        salesman2: {
          id: '33333333-3333-3333-3333-333333333333',
          user_id: '33333333-3333-3333-3333-333333333333',
          username: 'salesman2',
          full_name: 'Priya Sharma',
          role: 'salesman',
          phone: '+91 99999 00003',
          is_active: true,
        },
        manager: {
          id: '44444444-4444-4444-4444-444444444444',
          user_id: '44444444-4444-4444-4444-444444444444',
          username: 'manager',
          full_name: 'Manager User',
          role: 'admin', // map to admin for testing
          phone: '+91 99999 00004',
          is_active: true,
        },
      };

      const profileData = profileMap[username as keyof typeof profileMap];

      // Create a mock user and session for testing
      const mockUser = {
        id: profileData.user_id,
        email: `${username}@test.com`,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_metadata: {},
        app_metadata: {},
      } as User;

      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: mockUser,
      } as Session;

      // Set the mock session and user
      setSession(mockSession);
      setUser(mockUser);
      setProfile(profileData);

      return { error: null };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const isAdmin = profile?.role === 'admin';
  const isSalesman = profile?.role === 'salesman';

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    isAdmin,
    isSalesman,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};