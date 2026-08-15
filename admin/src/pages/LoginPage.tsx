import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../services/authService';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: authError } = await authService.signIn(email, password);

      if (authError) {
        console.error('Login error details:', authError);
        // Map Supabase raw errors to friendly user messages
        if (
          authError.message.includes('Invalid login credentials') ||
          authError.status === 400
        ) {
          setError('Email or password is incorrect.');
        } else if (
          authError.message.toLowerCase().includes('network') ||
          authError.message.toLowerCase().includes('fetch')
        ) {
          setError('Unable to connect right now. Please check your internet connection.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        // Redirect on success
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Unexpected auth exception:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-6 select-none">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <h2 className="font-serif text-[#F5EFE7] text-2xl uppercase tracking-[0.2em] font-medium">
            Tabjul Prabhakar Gupta
          </h2>
          <span className="text-xs text-[#C9A24A] font-mono uppercase tracking-[0.15em] block mt-2">
            Jewellers Admin Portal
          </span>
        </div>

        {/* Login Card */}
        <div className="bg-[#131315] border border-[rgba(201,162,74,0.15)] p-8 rounded shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSignIn} className="space-y-6">
            {/* Error Message display with ARIA support */}
            {error && (
              <div 
                aria-live="polite" 
                className="bg-red-950/40 border border-red-800/40 text-red-400 p-3.5 text-xs font-light rounded leading-relaxed"
              >
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label 
                htmlFor="email-input" 
                className="block text-xs uppercase tracking-widest text-[#B8B0A8] font-mono font-medium"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                  <Mail size={16} />
                </span>
                <input
                  id="email-input"
                  type="email"
                  required
                  disabled={isLoading}
                  placeholder="name@tpgjewellers.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] placeholder-zinc-600 text-sm rounded transition-all duration-300 hover:border-[rgba(201,162,74,0.3)] focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password-input" 
                className="block text-xs uppercase tracking-widest text-[#B8B0A8] font-mono font-medium"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                  <Lock size={16} />
                </span>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] placeholder-zinc-600 text-sm rounded transition-all duration-300 hover:border-[rgba(201,162,74,0.3)] focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A]"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-[#C9A24A] transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#C9A24A] text-black font-mono font-bold text-xs uppercase tracking-widest rounded hover:bg-[#b08b3c] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
