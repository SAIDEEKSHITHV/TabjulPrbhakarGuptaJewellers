import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Gem, 
  FolderHeart, 
  Settings, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', to: '/products', icon: Gem },
    { label: 'Collections', to: '/collections', icon: FolderHeart },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    onClose();
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full justify-between p-6">
      <div className="space-y-8">
        {/* Brand Header */}
        <div>
          <h2 className="font-serif text-[#F5EFE7] text-lg uppercase tracking-[0.18em] font-medium">
            TPG Jewellers
          </h2>
          <span className="text-[10px] text-[#C9A24A] font-mono uppercase tracking-[0.12em] block mt-1">
            Admin Dashboard
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={onClose}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 text-sm rounded transition-all duration-300 ${
                    isActive
                      ? 'bg-[rgba(201,162,74,0.1)] text-[#C9A24A] font-medium border-l-2 border-[#C9A24A]'
                      : 'text-[#B8B0A8] hover:text-[#F5EFE7] hover:bg-white/[0.02]'
                  }`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3.5 w-full px-4 py-3 text-sm text-[#B8B0A8] hover:text-[#C9A24A] hover:bg-[rgba(201,162,74,0.05)] rounded transition-all duration-300 border border-transparent hover:border-[rgba(201,162,74,0.15)]"
      >
        <LogOut size={16} />
        <span>Logout</span>
      </button>
    </div>
  );
}
