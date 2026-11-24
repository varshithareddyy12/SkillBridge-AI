import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Target,
  Sparkles,
  Compass,
  Code2,
  Mic,
  BarChart3,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { cn } from '../utils/cn.js';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Resume Intelligence', path: '/resumes', icon: FileText },
    { label: 'Job Analyzer', path: '/jobs', icon: Briefcase },
    { label: 'Job Matching Engine', path: '/matches', icon: Target },
    { label: 'Skill Gap Matrix', path: '/skills', icon: Sparkles },
    { label: 'Learning Roadmap', path: '/roadmaps', icon: Compass },
    { label: 'Project Studio', path: '/projects', icon: Code2 },
    { label: 'AI Mock Interview', path: '/interviews', icon: Mic },
    { label: 'Career Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Profile & Goals', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0D1117] border-r border-gray-800/80 flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-gray-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              SkillBridge <span className="text-xs bg-indigo-500/20 text-indigo-400 font-mono px-1.5 py-0.5 rounded border border-indigo-500/30">AI</span>
            </span>
            <p className="text-[10px] text-gray-400 tracking-wider font-medium uppercase">Career Intelligence</p>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400')} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-gray-800/80 bg-gray-900/40">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-lg bg-gray-800/30 border border-gray-800/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-200 truncate">{user?.fullName || 'User'}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.targetRole || 'Software Engineer'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
