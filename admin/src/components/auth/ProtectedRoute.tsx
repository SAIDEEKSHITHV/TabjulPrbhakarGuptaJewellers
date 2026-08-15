import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogOut } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isAdmin, signOut } = useAuth();

  if (loading) {
    // Premium dark-luxury theme loading skeletons
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4 animate-pulse">
          <div className="h-6 bg-white/5 rounded w-1/3 mx-auto" />
          <div className="h-[200px] bg-[#131315]/40 border border-[rgba(201,162,74,0.15)] rounded w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-6 select-none">
        <div className="w-full max-w-md bg-[#131315] border border-[rgba(201,162,74,0.15)] p-8 rounded shadow-[0_4px_30px_rgba(0,0,0,0.5)] text-center space-y-6">
          
          {/* Header Accent Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-red-950/30 border border-red-800/30 flex items-center justify-center text-red-500">
            <ShieldAlert size={28} />
          </div>

          {/* Alert Message */}
          <div className="space-y-2">
            <h2 className="font-serif text-[#F5EFE7] text-2xl uppercase tracking-wider font-medium">
              Access Denied
            </h2>
            <span className="text-xs text-[#C9A24A] font-mono uppercase tracking-[0.15em] block">
              Unauthorized Account
            </span>
          </div>

          <div className="w-12 h-px bg-[rgba(201,162,74,0.25)] mx-auto" />

          {/* Description */}
          <p className="text-xs text-[#B8B0A8] leading-relaxed font-light max-w-sm mx-auto">
            This account does not have administrator privileges. Please contact the system administrator if you believe this is an error.
          </p>

          {/* Sign Out Button */}
          <button
            onClick={signOut}
            className="w-full py-3 bg-[#C9A24A] text-black font-mono font-bold text-xs uppercase tracking-widest rounded hover:bg-[#b08b3c] transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
