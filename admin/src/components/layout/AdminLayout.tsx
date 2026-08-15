import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col md:flex-row">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 bg-[#131315] border-r border-[rgba(201,162,74,0.15)] h-screen sticky top-0">
        <Sidebar onClose={() => {}} />
      </aside>

      {/* Mobile Top Header Navigation */}
      <div className="block md:hidden bg-[#131315] border-b border-[rgba(201,162,74,0.15)] sticky top-0 z-40">
        <MobileHeader onToggleMenu={() => setMobileMenuOpen((prev) => !prev)} />
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Drawer Backdrop blur */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu Drawer Content */}
          <div className="relative w-64 max-w-xs bg-[#131315] border-r border-[rgba(201,162,74,0.15)] flex flex-col z-10 animate-in slide-in-from-left duration-300">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-full">
        <div className="max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
