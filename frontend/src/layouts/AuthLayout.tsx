import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Zap, Compass } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            SkillBridge <span className="text-indigo-400">AI</span>
          </span>
        </Link>
        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
          "Don't just discover whether you're job-ready. Discover exactly how to become job-ready."
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-[#111827] py-8 px-6 sm:px-10 shadow-2xl border border-gray-800/80 rounded-2xl relative">
          <Outlet />
        </div>

        {/* Value pillars */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Deterministic Scoring</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Custom Roadmaps</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Skills</span>
          </div>
        </div>
      </div>
    </div>
  );
};
