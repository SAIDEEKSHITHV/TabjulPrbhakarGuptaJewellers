import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  onToggleMenu: () => void;
}

export default function MobileHeader({ onToggleMenu }: MobileHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div>
        <h1 className="font-serif text-[#F5EFE7] text-md uppercase tracking-[0.15em] font-medium">
          TPG Jewellers
        </h1>
      </div>
      
      <button
        onClick={onToggleMenu}
        className="text-[#F5EFE7] hover:text-[#C9A24A] transition-colors duration-300 p-1"
        aria-label="Toggle Menu"
      >
        <Menu size={22} strokeWidth={1.5} />
      </button>
    </header>
  );
}
