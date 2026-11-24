import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar.js';
import { Navbar } from '../components/Navbar.js';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/dashboard':
        return 'Career Intelligence Dashboard';
      case '/resumes':
        return 'Resume Intelligence & ATS Profile';
      case '/jobs':
        return 'Job Description Analyzer';
      case '/matches':
        return 'Intelligent Job Matching Engine';
      case '/skills':
        return 'Skill Gap Analysis Matrix';
      case '/roadmaps':
        return 'Personalized Learning Roadmap';
      case '/projects':
        return 'AI Practical Project Recommendations';
      case '/interviews':
        return 'AI Mock Interview Studio';
      case '/analytics':
        return 'Career Progress & Analytics';
      case '/profile':
        return 'Profile & Career Goals';
      default:
        return 'SkillBridge AI';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Navbar
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          title={getPageTitle(location.pathname)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
