import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const checkDemoUser = () => {
    const demoToken = localStorage.getItem('demo_token');
    const demoEmail = localStorage.getItem('demo_email');
    if (demoToken && demoEmail) {
      const mockUser = {
        id: demoToken === 'demo-token-host' ? 'demo-id-host' : 'demo-id-player',
        email: demoEmail,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as unknown as User;

      const mockSession = {
        access_token: demoToken,
        token_type: 'bearer',
        user: mockUser
      } as unknown as Session;

      setUser(mockUser);
      setSession(mockSession);
      setLoading(false);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (checkDemoUser()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!localStorage.getItem('demo_token')) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem('demo_token')) {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem('demo_token');
    localStorage.removeItem('demo_email');
    setUser(null);
    setSession(null);
    await supabase.auth.signOut();
  };


  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
