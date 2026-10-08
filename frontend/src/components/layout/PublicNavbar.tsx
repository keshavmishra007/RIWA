import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-[#0F172A]">
                <span className="text-[#2563EB]">RIWA</span> Platform
              </span>
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link to="/how-it-works" className="text-[#475569] hover:text-[#0F172A] px-3 py-2 text-sm font-medium">
              How It Works
            </Link>
            <Link to="/intelligence" className="text-[#475569] hover:text-[#0F172A] px-3 py-2 text-sm font-medium">
              Intelligence
            </Link>
            <Link to="/demo" className="text-[#475569] hover:text-[#0F172A] px-3 py-2 text-sm font-medium">
              Demo
            </Link>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign In
            </button>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden border-t border-[#E2E8F0] bg-white">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/how-it-works"
              className="block pl-3 pr-4 py-2 text-base font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
              onClick={() => setIsOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/intelligence"
              className="block pl-3 pr-4 py-2 text-base font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
              onClick={() => setIsOpen(false)}
            >
              Intelligence
            </Link>
            <Link
              to="/demo"
              className="block pl-3 pr-4 py-2 text-base font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
              onClick={() => setIsOpen(false)}
            >
              Demo
            </Link>
            <div className="pl-3 pr-4 py-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/login');
                }}
                className="w-full text-center bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 rounded-md text-base font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
