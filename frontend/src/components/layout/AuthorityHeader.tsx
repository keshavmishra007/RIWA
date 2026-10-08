import React, { useState, useEffect } from 'react';
import { Menu, Bell, RefreshCw, User } from 'lucide-react';

interface AuthorityHeaderProps {
  title?: string;
  onMenuClick: () => void;
}

export const AuthorityHeader: React.FC<AuthorityHeaderProps> = ({ 
  title = 'Dashboard', 
  onMenuClick 
}) => {
  const [lastUpdated, setLastUpdated] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setLastUpdated(0);
    // Add real refresh logic here if needed
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="mr-4 p-1 rounded-md text-[#64748B] hover:bg-[#F1F5F9] md:hidden focus:outline-none"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[#0F172A]">{title}</h1>
          <p className="text-xs text-[#64748B] hidden sm:block">
            Tuesday, 29 September 2026 • Rewa
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="hidden sm:flex items-center text-xs text-[#64748B]">
          <span className="mr-2">Last updated {lastUpdated} sec ago</span>
          <button 
            onClick={handleRefresh}
            className="p-1.5 rounded-full hover:bg-[#F1F5F9] text-[#2563EB] transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <button className="relative p-2 rounded-full text-[#64748B] hover:bg-[#F1F5F9] transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#DC2626] border-2 border-white"></span>
        </button>

        <div className="h-8 w-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#475569] sm:hidden">
          <User size={16} />
        </div>
      </div>
    </header>
  );
};
