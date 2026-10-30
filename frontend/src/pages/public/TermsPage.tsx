import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, AlertTriangle, Scale, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
              <p className="text-slate-500 text-sm mt-1">
                RiWA — Rewa Intelligence For Watch and Action • Smart Rewa 2030 Initiative
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8 text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              1. Platform Purpose & Scope
            </h2>
            <p>
              RiWA provides a unified AI platform for reporting, consolidating, and monitoring non-emergency municipal civic issues (including road hazards, waterlogging, garbage accumulation, and street lighting failures) within the municipal limits of Rewa, Madhya Pradesh.
            </p>
          </section>

          <section className="space-y-3 bg-red-50 p-4 rounded-lg border border-red-200 text-red-900 text-sm">
            <h2 className="flex items-center gap-2 font-bold text-base text-red-950">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              2. Emergency Notice & Disclaimer
            </h2>
            <p className="mt-1">
              <strong>DO NOT USE RiWA FOR EMERGENCIES:</strong> RiWA is strictly an asynchronous civic tracking platform. It is not connected to instant dispatch 911/112 CAD systems. If you or someone else is in immediate danger, witnessing a crime, experiencing a medical emergency, or encountering a structural fire, please immediately call official Madhya Pradesh emergency numbers:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center font-bold">
              <div className="bg-white p-2 rounded border border-red-200 text-red-700">112 (ERSS)</div>
              <div className="bg-white p-2 rounded border border-red-200 text-red-700">108 (Ambulance)</div>
              <div className="bg-white p-2 rounded border border-red-200 text-red-700">101 (Fire)</div>
              <div className="bg-white p-2 rounded border border-red-200 text-red-700">181 (CM Helpline)</div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">3. Citizen Code of Conduct</h2>
            <p>When reporting civic issues, citizens agree to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
              <li>Submit truthful, genuine observations of civic hazards in public spaces.</li>
              <li>Avoid submitting abusive, harassing, defamatory, or false content.</li>
              <li>Refrain from spamming duplicate reports with automated bots or deceptive GPS coordinates.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">4. Hackathon Attribution & Open Governance</h2>
            <p>
              RiWA was conceived and demonstrated for the <strong>iComputex Tech Fest 2026</strong> as an innovative civic intelligence platform uniting citizens and local administration under the Smart Rewa 2030 roadmap.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center flex-wrap gap-4">
            <span className="text-xs text-slate-500">
              Last updated: October 2026 • Municipal Governance Guidelines
            </span>
            <Link to="/how-it-works">
              <Button variant="secondary" size="sm">
                How RiWA Works
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
