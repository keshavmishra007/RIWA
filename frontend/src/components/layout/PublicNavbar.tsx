import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-800/80 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <span className="font-black text-2xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
                <span className="text-[#3B82F6]">RiWA</span>
              </span>
              <span className="hidden sm:inline-flex items-center text-xs lg:text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                (Rewa Intelligence for Work and Action)
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8 text-sm font-medium">
            <Link 
              to="/how-it-works" 
              className="text-slate-300 hover:text-white transition-colors py-2 focus:outline-none focus:text-blue-400"
            >
              How It Works
            </Link>
            <Link 
              to="/demo" 
              className="text-slate-300 hover:text-white transition-colors py-2 focus:outline-none focus:text-blue-400"
            >
              Live Demo
            </Link>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm shadow-blue-600/30 active:scale-95 cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-[#0B132B]/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/how-it-works"
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            How It Works
          </Link>
          <Link
            to="/demo"
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Live Demo
          </Link>
          <div className="pt-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/login');
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg text-base font-semibold shadow-md transition-colors"
            >
              <span>Sign In to Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
