import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, type User, type Session } from '../services/authService';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async (userEmail: string | undefined): Promise<boolean> => {
    if (!userEmail) return false;
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) {
        console.error('Error checking admin status RPC:', error);
        return false;
      }
      return !!data;
    } catch (err) {
      console.error('Exception checking admin status:', err);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Load initial session on mount
    authService.getCurrentSession()
      .then(async (currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          const admin = await checkAdminStatus(currentUser.email);
          if (isMounted) setIsAdmin(admin);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching session on mount:', err);
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      });

    // Subscribe to session transitions (login, logout, token refresh)
    const subscription = authService.onAuthStateChange(async (_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      const activeUser = currentSession?.user ?? null;
      setUser(activeUser);
      
      if (activeUser) {
        setLoading(true);
        const admin = await checkAdminStatus(activeUser.email);
        if (isMounted) {
          setIsAdmin(admin);
          setLoading(false);
        }
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
    } catch (e) {
      console.error('Logout request failed:', e);
    } finally {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export type { User, Session };
