import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  BarChart3, 
  Building2, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

export const AuthoritySidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/authority/dashboard', icon: LayoutDashboard },
        { name: 'Live Incidents', path: '/authority/incidents', icon: AlertTriangle },
        { name: 'Map', path: '/authority/map', icon: Map },
      ]
    },
    {
      label: 'INTELLIGENCE',
      items: [
        { name: 'Hotspots', path: '/authority/hotspots', icon: Map },
        { name: 'Analytics', path: '/authority/analytics', icon: BarChart3 },
      ]
    },
    {
      label: 'OPERATIONS',
      items: [
        { name: 'Departments', path: '/authority/departments', icon: Building2 },
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { name: 'Settings', path: '/authority/settings', icon: Settings },
      ]
    }
  ];

  const sidebarClass = `fixed inset-y-0 left-0 z-40 bg-white border-r border-[#E2E8F0] transition-all duration-300 ease-in-out flex flex-col
    ${isCollapsed ? 'w-20' : 'w-[260px]'}
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={sidebarClass}>
        {/* Logo area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E2E8F0]">
          <div className="flex items-center overflow-hidden whitespace-nowrap">
            <span className="font-bold text-xl text-[#2563EB]">RIWA</span>
            {!isCollapsed && (
              <span className="ml-2 text-sm text-[#64748B] font-medium truncate">
                Rewa Civic Intelligence
              </span>
            )}
          </div>
          <button 
            className="hidden md:block p-1 rounded-md text-[#64748B] hover:bg-[#F1F5F9]"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-6 px-3">
              {!isCollapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-[#64748B] tracking-wider">
                  {group.label}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#DBEAFE] text-[#2563EB]'
                          : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                      } ${isCollapsed ? 'justify-center' : ''}`
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon size={20} className={isCollapsed ? '' : 'mr-3'} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* User profile area */}
        <div className="p-4 border-t border-[#E2E8F0]">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className={`flex items-center ${isCollapsed ? '' : 'overflow-hidden'}`}>
              <div className="h-8 w-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white flex-shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              {!isCollapsed && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-[#0F172A] truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-[#64748B] truncate">{user?.role || 'Authority'}</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button 
                onClick={logout}
                className="p-1.5 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-md transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
          {isCollapsed && (
            <button 
              onClick={logout}
              className="mt-3 w-full flex justify-center p-2 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-md transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
