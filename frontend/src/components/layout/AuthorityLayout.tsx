import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { AuthoritySidebar } from './AuthoritySidebar';
import { AuthorityHeader } from './AuthorityHeader';

export const AuthorityLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <AuthoritySidebar 
        isMobileOpen={isMobileMenuOpen} 
        setIsMobileOpen={setIsMobileMenuOpen} 
      />
      
      <div className="flex-1 flex flex-col md:pl-[260px] transition-all duration-300">
        <AuthorityHeader 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-40 px-6 py-2 flex justify-between items-center">
        <NavLink 
          to="/authority/dashboard" 
          className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] mt-1 font-medium">Dashboard</span>
        </NavLink>
        <NavLink 
          to="/authority/map" 
          className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`}
        >
          <Map size={20} />
          <span className="text-[10px] mt-1 font-medium">Map</span>
        </NavLink>
        <NavLink 
          to="/authority/incidents" 
          className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`}
        >
          <AlertTriangle size={20} />
          <span className="text-[10px] mt-1 font-medium">Incidents</span>
        </NavLink>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center p-2 text-[#64748B]"
        >
          <MoreHorizontal size={20} />
          <span className="text-[10px] mt-1 font-medium">More</span>
        </button>
      </div>
    </div>
  );
};
