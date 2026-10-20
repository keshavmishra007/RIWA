import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, ShieldAlert, HeartPulse, Flame, Users, ShieldCheck } from 'lucide-react';

interface EmergencyContact {
  number: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  verifiedBadge?: string;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    number: '112',
    label: 'Emergency Response (ERSS)',
    description: 'Police, Fire & Medical 24x7',
    icon: ShieldAlert,
    verifiedBadge: 'National / MP'
  },
  {
    number: '108',
    label: 'Ambulance / Medical',
    description: 'Emergency Medical Dispatch',
    icon: HeartPulse,
    verifiedBadge: 'MP Sanjeevani'
  },
  {
    number: '101',
    label: 'Fire & Rescue Service',
    description: 'Rewa Fire Control Room',
    icon: Flame,
    verifiedBadge: 'Official Fire'
  },
  {
    number: '181',
    label: 'CM Helpline & Grievance',
    description: 'Madhya Pradesh Public Service',
    icon: Users,
    verifiedBadge: 'MP State'
  },
  {
    number: '1090',
    label: 'Women Safety Helpline',
    description: 'MP Police Special Cell',
    icon: ShieldCheck,
    verifiedBadge: 'MP Police'
  }
];

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[#0F172A] text-white border-t border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Column 1: RIWA Branding & Purpose */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              <span className="font-extrabold text-2xl tracking-tight text-white">
                <span className="text-[#2563EB]">RIWA</span> Platform
              </span>
            </Link>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Rewa Intelligence for Watch & Action. Fusing scattered citizen reports into clear, explainable civic incidents to accelerate municipal action.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#1E293B] text-[#06B6D4] border border-[#334155]">
                SMART REWA 2030
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1E293B] text-slate-300 border border-[#334155]">
                Rewa Nagar Nigam
              </span>
            </div>
          </div>
          
          {/* Column 2: Platform Navigation */}
          <div>
            <h3 className="text-xs font-bold tracking-wider uppercase text-[#E2E8F0] mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link 
                  to="/how-it-works" 
                  className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1.5 py-1"
                >
                  <span>How It Works</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/demo" 
                  className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1.5 py-1"
                >
                  <span>Interactive Live Demo</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1.5 py-1"
                >
                  <span>Citizen Portal (Submit Report)</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1.5 py-1"
                >
                  <span>Authority Command Center</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Connect Emergency Contacts (Rewa, MP) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-[#E2E8F0]">
                Quick Connect (Emergency)
              </h3>
            </div>
            
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              Direct emergency helplines for Rewa, Madhya Pradesh. Tap to call directly:
            </p>

            <div className="space-y-2 pt-1">
              {EMERGENCY_CONTACTS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.number}
                    href={`tel:${item.number}`}
                    className="group flex items-center justify-between p-2 rounded-lg bg-[#1E293B]/70 hover:bg-[#1E293B] border border-[#334155]/60 hover:border-blue-500/50 transition-all text-xs"
                    title={`Call ${item.label} (${item.number})`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1 rounded bg-slate-800 text-blue-400 group-hover:text-blue-300">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-200 group-hover:text-white flex items-center gap-1.5">
                          <span>{item.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-xs ml-2 shrink-0 group-hover:bg-emerald-900/80">
                      {item.number}
                    </span>
                  </a>
                );
              })}
            </div>

            <div className="p-2.5 rounded-md bg-amber-950/30 border border-amber-900/40 text-[11px] text-amber-300/90 leading-tight">
              <span className="font-semibold text-amber-200">Immediate Danger?</span> RIWA is for non-emergency civic issues. Dial 112 directly for life-threatening crises.
            </div>
          </div>

          {/* Column 4: Governance & Legal */}
          <div>
            <h3 className="text-xs font-bold tracking-wider uppercase text-[#E2E8F0] mb-4">
              Governance & Policies
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1.5 py-1"
                >
                  <span>Civic Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1.5 py-1"
                >
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li className="pt-2 text-xs text-[#64748B] leading-relaxed">
                Rewa Nagar Nigam Municipal Governance & Smart City Infrastructure Division.
              </li>
            </ul>
          </div>

        </div>
        
        {/* Bottom Attribution Bar */}
        <div className="mt-12 pt-8 border-t border-[#334155] flex flex-col md:flex-row justify-between items-center text-xs text-[#94A3B8] gap-4">
          <p>
            &copy; {new Date().getFullYear()} RIWA — Rewa Intelligence for Watch & Action. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Developed for <strong>iComputex Tech Fest 2026</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Madhya Pradesh, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
