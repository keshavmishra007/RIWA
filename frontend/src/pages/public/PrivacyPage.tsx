import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, MapPin, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const PrivacyPage: React.FC = () => {
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
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-slate-500 text-sm mt-1">
                RiWA — Rewa Intelligence For Watch and Action • Smart Rewa 2030 Initiative
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8 text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              1. Our Civic Data Commitment
            </h2>
            <p>
              RiWA (Rewa Intelligence For Watch and Action) is a civic governance platform engineered to improve municipal transparency and emergency civic response across Rewa, Madhya Pradesh. We collect only the information strictly necessary to identify, verify, and resolve public infrastructure issues.
            </p>
            <p className="font-medium text-slate-900">
              We never sell, monetize, or share citizen personal information with commercial advertisers or third-party brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              2. Location Information & Geolocation
            </h2>
            <p>
              When submitting a complaint, you may choose to provide coordinates via <strong>“Use My Location”</strong> or by manually clicking on the interactive map:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
              <li>Geolocation is requested exclusively on-demand upon clicking the button in your browser.</li>
              <li>We never track your background location when you are not actively submitting a report.</li>
              <li>Coordinates are used solely to cluster nearby reports into unified incidents and route municipal work orders to the appropriate Nagar Nigam Rewa ward.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              3. Photo Evidence & Citizen Privacy
            </h2>
            <p>
              Images uploaded as evidence for potholes, garbage dumps, or waterlogging are stored in secure cloud storage. Photos should strictly depict public physical hazards. We advise citizens not to photograph individuals, vehicular license plates, or private domestic premises.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">4. Data Access by Municipal Authorities</h2>
            <p>
              Authorized personnel from Rewa Municipal Corporation (Nagar Nigam), Public Works Department (PWD), and Electrical Utilities have access to aggregated incident summaries, citizen descriptions, and photos to dispatch field teams and mark resolution updates.
            </p>
          </section>

          <section className="space-y-3 bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-900 text-sm">
            <p className="font-semibold">Notice regarding Immediate Emergencies:</p>
            <p>
              RiWA is a civic issue remediation tool and is <strong>not</strong> an emergency response dispatch service. For urgent life-threatening crises, crimes, medical emergencies, or fires, dial official emergency helplines directly: <strong>112 (ERSS)</strong>, <strong>108 (Ambulance)</strong>, or <strong>101 (Fire)</strong>.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center flex-wrap gap-4">
            <span className="text-xs text-slate-500">
              Last updated: October 2026 • Prepared for iComputex Tech Fest 2026
            </span>
            <Link to="/demo">
              <Button variant="secondary" size="sm">
                Explore Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
