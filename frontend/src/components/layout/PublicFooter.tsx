import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center">
              <span className="font-bold text-2xl">
                <span className="text-[#2563EB]">RIWA</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-[#94A3B8] max-w-sm">
              Rewa Civic Intelligence Platform. Empowering authorities and citizens to build a smarter, safer, and more responsive city.
            </p>
            <div className="mt-6 flex space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#1E293B] text-[#06B6D4] border border-[#334155]">
                SMART REWA 2030
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-[#E2E8F0]">Platform</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/how-it-works" className="text-sm text-[#94A3B8] hover:text-white transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/intelligence" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Intelligence</Link>
              </li>
              <li>
                <Link to="/demo" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Live Demo</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-[#E2E8F0]">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-[#94A3B8] hover:text-white transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-[#334155] flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-[#94A3B8]">
            &copy; {new Date().getFullYear()} RIWA Platform. All rights reserved.
          </p>
          <p className="text-sm text-[#94A3B8] mt-4 md:mt-0">
            Presented at iComputex Tech Fest 2026
          </p>
        </div>
      </div>
    </footer>
  );
};
