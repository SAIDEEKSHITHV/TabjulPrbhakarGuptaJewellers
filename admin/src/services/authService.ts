import { supabase } from '../lib/supabaseClient';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export const authService = {
  /**
   * Log in user using email and password.
   */
  async signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return {
      user: data.user,
      session: data.session,
      error,
    };
  },

  /**
   * Log out the current user session.
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Retrieve active session data.
   */
  async getCurrentSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Fetch authenticated user details.
   */
  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  /**
   * Subscribe to authentication status updates.
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return subscription;
  }
};
export type { User, Session, AuthError };
