import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, PlusCircle, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const CitizenLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/citizen" className="flex items-center">
                <span className="font-bold text-xl text-[#2563EB]">RiWA</span>
                <span className="ml-2 text-sm text-[#64748B] hidden sm:block">Citizen Portal</span>
              </Link>
            </div>
            
            <div className="hidden sm:flex items-center space-x-4">
              <NavLink to="/citizen/dashboard" className={({isActive}) => `text-sm font-medium px-3 py-2 rounded-md ${isActive ? 'text-[#2563EB] bg-[#F1F5F9]' : 'text-[#475569] hover:bg-[#F1F5F9]'}`}>
                Home
              </NavLink>
              <NavLink to="/citizen/report" className={({isActive}) => `text-sm font-medium px-3 py-2 rounded-md ${isActive ? 'text-[#2563EB] bg-[#F1F5F9]' : 'text-[#475569] hover:bg-[#F1F5F9]'}`}>
                New Report
              </NavLink>
              <NavLink to="/citizen/my-reports" className={({isActive}) => `text-sm font-medium px-3 py-2 rounded-md ${isActive ? 'text-[#2563EB] bg-[#F1F5F9]' : 'text-[#475569] hover:bg-[#F1F5F9]'}`}>
                My Reports
              </NavLink>
              
              <div className="h-6 w-px bg-[#E2E8F0] mx-2"></div>
              
              <div className="flex items-center text-sm">
                <div className="h-8 w-8 rounded-full bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center mr-2">
                  <User size={16} />
                </div>
                <span className="text-[#0F172A] font-medium mr-4">{user?.name || 'Citizen'}</span>
                <button 
                  onClick={handleLogout}
                  className="text-[#64748B] hover:text-[#DC2626] transition-colors p-2 rounded-md hover:bg-[#FEE2E2]"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-[#64748B] hover:bg-[#F1F5F9] focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-[#E2E8F0] bg-white">
            <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center mr-3">
                  <User size={16} />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#0F172A]">{user?.name || 'Citizen'}</div>
                  <div className="text-xs text-[#64748B]">{user?.email || 'citizen@rewa.gov'}</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-[#64748B] hover:text-[#DC2626] bg-[#F1F5F9] rounded-md"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20 sm:pb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-40 px-6 py-2 flex justify-between items-center pb-safe">
        <NavLink 
          to="/citizen/dashboard" 
          className={({ isActive }) => `flex flex-col items-center p-2 flex-1 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`}
        >
          <Home size={20} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </NavLink>
        <NavLink 
          to="/citizen/report" 
          className={({ isActive }) => `flex flex-col items-center p-2 flex-1 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`}
        >
          <PlusCircle size={20} />
          <span className="text-[10px] mt-1 font-medium">Report</span>
        </NavLink>
        <NavLink 
          to="/citizen/my-reports" 
          className={({ isActive }) => `flex flex-col items-center p-2 flex-1 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`}
        >
          <FileText size={20} />
          <span className="text-[10px] mt-1 font-medium">My Reports</span>
        </NavLink>
      </div>
    </div>
  );
};
