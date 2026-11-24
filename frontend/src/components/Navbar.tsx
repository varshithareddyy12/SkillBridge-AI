import React from 'react';
import { Menu, Sparkles, User, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onMenuToggle: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, title }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-gray-800/80 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {/* Readiness Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>PostgreSQL Active</span>
        </div>

        {/* Target role pill */}
        {user?.targetRole && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target: {user.targetRole}</span>
          </div>
        )}

        {/* User avatar */}
        <Link
          to="/profile"
          className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-800/80 transition-colors text-gray-300 hover:text-white"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.fullName?.charAt(0) || <User className="w-4 h-4" />}
          </div>
          <span className="text-xs font-medium hidden sm:inline">{user?.fullName?.split(' ')[0] || 'Profile'}</span>
        </Link>
      </div>
    </header>
  );
};
