import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Brain,
  Shield,
  FileText,
  GitMerge,
  ArrowRight,
  Loader2,
  Sparkles,
  Building2,
  CheckCircle2,
  MapPin,
  Activity,
  ChevronRight,
  Users
} from 'lucide-react';
import { CivicMap } from '../../components/map/CivicMap';
import { incidentsApi, analyticsApi } from '../../services/api';
import type { Incident, AnalyticsOverview } from '../../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      incidentsApi.getAll(),
      analyticsApi.getOverview().catch(() => null)
    ])
      .then(([incData, ovData]) => {
        if (isMounted) {
          setIncidents(incData || []);
          setOverview(ovData);
          setIsLoadingData(false);
        }
      })
      .catch((err) => {
        console.warn('Command center preview live fetch notice:', err);
        if (isMounted) setIsLoadingData(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeIncidents = incidents.filter(
    (i) => i.status !== 'CLOSED' && (i.reportCount || 0) > 0
  );

  // Honest illustrative demonstration incidents based on real Rewa cases
  const demoFallbackIncidents: Incident[] = [
    {
      id: 'INC-666',
      incidentCode: 'INC-666',
      title: 'Pothole & Road Crater Cluster',
      category: 'road_damage',
      priority: 'CRITICAL',
      status: 'OPEN',
      latitude: 24.5372,
      longitude: 81.3015,
      reportCount: 3,
      department: 'Public Works',
      fusionConfidence: 0.92,
      trend: 'RISING',
      summary: 'Multiple citizen complaints of severe road craters near College Chauraha.',
      aiBrief: 'Deep road potholes causing accidents for two-wheelers.',
      recommendedActions: ['Dispatch cold-mix patch crew'],
      areaKm: 0.3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'INC-788',
      incidentCode: 'INC-788',
      title: 'Hospital Sanitation & Waste Overflow',
      category: 'garbage',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      latitude: 24.5420,
      longitude: 81.2940,
      reportCount: 2,
      department: 'Sanitation',
      fusionConfidence: 0.94,
      trend: 'STABLE',
      summary: 'Waste accumulation reported near hospital entrance.',
      aiBrief: 'Sanitation clearance required.',
      recommendedActions: ['Sanitation team dispatched'],
      areaKm: 0.2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const hasLiveData = activeIncidents.length > 0;
  const displayIncidents = hasLiveData ? activeIncidents : demoFallbackIncidents;

  const activeCount = overview
    ? overview.activeIncidents
    : hasLiveData
    ? activeIncidents.length
    : 2;

  const criticalCount = overview
    ? overview.criticalIncidents
    : hasLiveData
    ? activeIncidents.filter((i) => i.priority === 'CRITICAL').length
    : 1;

  const priorityList = [...displayIncidents]
    .sort((a, b) => {
      const priorityWeight: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-600 selection:text-white">

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Midnight Command Center Aesthetic)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#070C18] text-white pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-slate-800">
        {/* Subtle grid pattern & glow effects */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #3B82F6 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-blue-600/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Mission & Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/30 text-blue-300 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>SMART REWA 2030 · AI FOR CIVIC GOVERNANCE</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                From scattered reports to one{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-200">
                  clear civic incident.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                In Rewa, 50 citizens might report the same pothole or flooded street. Traditional portals drown in duplicate noise. RIWA’s multi-signal AI understands raw complaints, fuses related signals into unified incidents, and coordinates municipal action.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/demo" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
                    <span>Explore Live Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <a href="#transformation" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 font-medium px-6 py-3.5 rounded-xl transition-all cursor-pointer">
                    <span>How RIWA Works</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero Duplicate Fatigue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Explainable AI Confidence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Rewa Municipal Grid</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Live Fusion Card */}
            <div className="lg:col-span-5 w-full">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-1 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
                {/* HUD Header */}
                <div className="bg-[#0B132B] rounded-xl p-4 border border-slate-800/80">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                        Live Multi-Signal Engine
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-semibold">
                      Ward 14 • Rewa
                    </span>
                  </div>

                  {/* Flow Simulation Visual */}
                  <div className="py-4 space-y-3">
                    {/* Raw Inputs */}
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Incoming Citizen Reports</span>
                      <span className="text-cyan-400 font-mono">3 Signals Detected</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                          <span className="text-slate-300 truncate">"college chauraha ki road me bahut gadhe hai..."</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">Hinglish</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                          <span className="text-slate-300 truncate">"Very bad road craters in college chauraha..."</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">English</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                          <span className="text-slate-300 truncate">"Dangerous pothole cluster near crossing..."</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">Photo Attached</span>
                      </div>
                    </div>

                    {/* Central Fusion Bar */}
                    <div className="py-2 flex items-center justify-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-mono font-semibold">
                        <GitMerge className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                        <span>AI Auto-Merge Confidence: 92.4%</span>
                      </div>
                    </div>

                    {/* Consolidated Output */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border-l-4 border-l-red-500 border border-slate-800 shadow-md">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-red-400">INC-666</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800/80">
                            CRITICAL
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">3 Citizens Fused</span>
                      </div>
                      <p className="text-sm font-bold text-white leading-tight">
                        Pothole & Road Crater Cluster
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          College Chauraha
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">PWD Dispatched</span>
                      </div>
                    </div>
                  </div>

                  {/* Footnote */}
                  <div className="pt-2 text-center border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Demonstration visualization based on live Rewa database records
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. SIGNATURE SECTION: REPORT-TO-INCIDENT TRANSFORMATION
      ───────────────────────────────────────────────────────────── */}
      <section id="transformation" className="py-20 lg:py-28 px-4 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              RIWA Core Innovation
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              A complaint is a signal.{' '}
              <span className="text-blue-600 block sm:inline">An incident is what the city needs to understand.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Traditional municipal portals collect dozens of disconnected tickets for the same problem. RIWA treats citizen submissions as sensory signals, using multidimensional AI to fuse them into one verified physical incident.
            </p>
          </div>

          {/* Interactive Convergence Showcase */}
          <div className="p-6 sm:p-10 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Step 1: Raw Signals (Left, 4 cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Raw Citizen Signals</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">4 Reports</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>R-507 • 10:14 AM</span>
                      <span className="text-blue-600 font-semibold">Hinglish Text</span>
                    </div>
                    <p className="text-slate-800 font-medium">
                      "college chauraha ki road me bahut gadhe hai, sabse jada samasya hm bike walo ko hoti hai"
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>R-283 • 09:30 AM</span>
                      <span className="text-blue-600 font-semibold">English Text</span>
                    </div>
                    <p className="text-slate-800 font-medium">
                      "Very bad quality of road with a lot of potholes in college chauraha. Can cause accidents."
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>R-312 • 09:48 AM</span>
                      <span className="text-blue-600 font-semibold">Concise</span>
                    </div>
                    <p className="text-slate-800 font-medium">
                      "very bad quality of road in college chauraha"
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>R-968 • 11:02 AM</span>
                      <span className="text-blue-600 font-semibold">Photo Evidence</span>
                    </div>
                    <p className="text-slate-800 font-medium">
                      "Deep craters near crossing causing traffic standstill."
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: The Fusion Core (Center, 4 cols) */}
              <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-blue-200 shadow-sm space-y-5 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <GitMerge className="w-7 h-7" />
                </div>
                
                <div>
                  <h4 className="text-base font-bold text-slate-900">Multidimensional Fusion Core</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Auditable 4-gate verification before merging
                  </p>
                </div>

                {/* Score Breakdown Gauges */}
                <div className="space-y-3 text-left">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Semantic Similarity (Embeddings)</span>
                      <span className="text-blue-600 font-mono">94%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full w-[94%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Geospatial Proximity (&lt;500m)</span>
                      <span className="text-emerald-600 font-mono">±38m</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Temporal Gating (&lt;12 hrs)</span>
                      <span className="text-blue-600 font-mono">1.5 hrs</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full w-[88%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Category Compatibility</span>
                      <span className="text-green-600 font-mono">100% PWD</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full w-full" />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Auto-Merge Confidence: 90.8%
                  </span>
                </div>
              </div>

              {/* Step 3: Consolidated Incident (Right, 4 cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-red-600" />
                    <span>Actionable Civic Incident</span>
                  </h3>
                  <span className="text-xs font-mono text-emerald-600 font-semibold">1 Unified Item</span>
                </div>

                <div className="p-5 bg-white rounded-xl border-l-4 border-l-red-600 border border-slate-200 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-500">INC-666</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                      CRITICAL PRIORITY
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      Severe Road Damage & Pothole Hazard
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      College Chauraha, Rewa, MP
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-2">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Clustered Reports:</span>
                      <span className="font-bold text-slate-900">4 citizen submissions</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Assigned Department:</span>
                      <span className="font-bold text-blue-700">Public Works (PWD)</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Operational Status:</span>
                      <span className="font-bold text-amber-700">DISPATCHED</span>
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-slate-600 border-t border-slate-100">
                    <span className="font-semibold text-slate-800">AI Action Directive:</span>
                    <p className="mt-0.5 text-slate-500">
                      Deploy emergency road crew for asphalt patching; coordinate with traffic police during peak hours.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. THE THREE PILLARS: UNDERSTAND · FUSE · ACT
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 px-4 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200/80 text-slate-700 border border-slate-300">
              Intelligence Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Municipal Scale & Explainable AI
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Three coordinated layers transforming unstructured citizen input into transparent, prioritized public works execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1: UNDERSTAND */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-600 uppercase tracking-widest">
                    Phase 01 · Signal Parsing
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">UNDERSTAND</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Citizen reports are messy, colloquial, and often in Hindi/Hinglish. RIWA’s NLP pipeline extracts categories, evaluates danger hazards, and indexes location landmarks from unstructured text.
                </p>
                
                <div className="pt-2 space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>Multilingual Hindi, Hinglish & English extraction</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>Automated severity tagging (Low to Critical)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>Rewa landmark entity resolution</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 2: FUSE (Flagship Highlight) */}
            <div className="relative bg-white rounded-2xl border-2 border-blue-600 p-8 shadow-lg flex flex-col justify-between ring-4 ring-blue-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-600 text-white shadow-sm">
                RIWA Differentiator
              </div>

              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <GitMerge className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest">
                    Phase 02 · Fusion Engine
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">FUSE</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The heart of RIWA. High-dimensional vector embeddings, Haversine spatial radius gating (&lt;500m), and rolling time windows cluster duplicate reports into explainable incidents with zero ticket spam.
                </p>

                <div className="pt-2 space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center gap-2 text-blue-900 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>Cosine vector distance for semantic clustering</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center gap-2 text-blue-900 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>Geographic gating prevents merging distant issues</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center gap-2 text-blue-900 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span>Auditable transparency scores per incident</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 3: ACT */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">
                    Phase 03 · Action & Dispatch
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">ACT</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Authorities receive unified, pre-prioritized incidents mapped to the responsible municipal department (PWD, Sanitation, Electrical) with real-time density hotspot monitoring.
                </p>

                <div className="pt-2 space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Automated routing to Nagar Nigam departments</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Emerging hotspot detection for recurring issues</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>End-to-end resolution tracking with citizen updates</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. HOW IT WORKS (Connected 4-Step Stepper)
      ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-28 px-4 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              End-To-End Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              How RIWA Works in 4 Steps
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              From the moment a citizen spots a hazard on Rewa's streets to municipal crew resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 01 */}
            <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-300 font-mono">01</span>
                  <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">CITIZEN REPORTS</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A resident snaps a photo of a hazard and places a pin on the map. No complex paperwork or municipal login required.
                </p>
              </div>
              <span className="text-[11px] font-mono text-blue-600 font-semibold pt-3 border-t border-slate-200">
                Photo + GPS Location
              </span>
            </div>

            {/* Step 02 */}
            <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-300 font-mono">02</span>
                  <div className="p-2.5 bg-cyan-100 text-cyan-700 rounded-xl">
                    <Brain className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">AI UNDERSTANDS</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gemini multimodal AI analyzes the text and image, extracts hazard severity, classifies the category, and indexes spatial coordinates.
                </p>
              </div>
              <span className="text-[11px] font-mono text-cyan-700 font-semibold pt-3 border-t border-slate-200">
                Category & Severity Gating
              </span>
            </div>

            {/* Step 03 */}
            <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-300 font-mono">03</span>
                  <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                    <GitMerge className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">INCIDENT FUSION</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The report is compared against open city incidents within 500m. If semantically identical, it merges seamlessly with full history preserved.
                </p>
              </div>
              <span className="text-[11px] font-mono text-blue-600 font-semibold pt-3 border-t border-slate-200">
                &gt;85% Confidence Merge
              </span>
            </div>

            {/* Step 04 */}
            <div className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-300 font-mono">04</span>
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">MUNICIPAL ACTION</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The command center receives the deduplicated, ranked incident. Work orders are dispatched and citizens track progress until verified resolution.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 font-semibold pt-3 border-t border-slate-200">
                Dispatch & Live Updates
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. COMMAND CENTER PREVIEW (Geospatial Intelligence)
      ───────────────────────────────────────────────────────────── */}
      <section id="command-center" className="py-20 lg:py-28 px-4 bg-[#0B132B] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800/60">
              Operational Command Center
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              See what is happening before the queue becomes noise.
            </h2>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
              Explore how Rewa city authorities visualize live fused incidents, monitor hotspots, and dispatch resources across all municipal wards.
            </p>
          </div>

          {/* Master Operational Frame */}
          <div className="bg-[#0F172A] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            
            {/* Command Center Titlebar */}
            <div className="px-6 py-4 bg-[#090D1A] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-950 text-blue-400 border border-blue-800/80 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>City Intelligence Command Center</span>
                    <span className="text-xs font-mono font-normal text-slate-400">Rewa, MP</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live GIS Layer • Centered on Rewa Municipal Jurisdiction
                  </p>
                </div>
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {hasLiveData ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Supabase Feed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/80">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Interactive Demonstration Preview
                  </span>
                )}
                <span className="px-3 py-1 bg-red-950 text-red-400 border border-red-800/60 rounded-full text-xs font-bold">
                  {criticalCount} Critical
                </span>
                <span className="px-3 py-1 bg-blue-950 text-blue-300 border border-blue-800/60 rounded-full text-xs font-bold">
                  {activeCount} Active
                </span>
              </div>
            </div>

            {/* Map & Queue Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* Left: Interactive Leaflet Map (8 cols) */}
              <div className="lg:col-span-8 relative h-[380px] sm:h-[460px] bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800">
                {isLoadingData && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-400 gap-3 z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="text-xs font-medium">Connecting to Rewa Incident Map...</span>
                  </div>
                )}
                
                <CivicMap
                  incidents={displayIncidents}
                  hotspots={[]}
                  onIncidentClick={() => navigate('/demo')}
                  height="100%"
                  showLegend={false}
                  markerActionLabel="Explore in Live Demo"
                />
              </div>

              {/* Right: Priority Action Queue (4 cols) */}
              <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-[#0F172A] space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4 text-red-400" />
                      <span>Priority Action Queue</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">Ranked by AI</span>
                  </div>

                  <div className="space-y-3">
                    {priorityList.map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => navigate('/demo')}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:border-blue-500 bg-slate-900/80 hover:bg-slate-900 ${
                          inc.priority === 'CRITICAL'
                            ? 'border-l-4 border-l-red-500 border-slate-800'
                            : 'border-l-4 border-l-orange-500 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-mono font-bold ${
                            inc.priority === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'
                          }`}>
                            {inc.incidentCode || inc.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            inc.priority === 'CRITICAL' 
                              ? 'bg-red-950 text-red-300 border border-red-800/60' 
                              : 'bg-orange-950 text-orange-300 border border-orange-800/60'
                          }`}>
                            {inc.priority}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-slate-200 line-clamp-1">{inc.title}</div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            {inc.reportCount} citizen reports
                          </span>
                          <span className="text-blue-400 font-medium text-[11px] hover:underline flex items-center gap-0.5">
                            Inspect <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Directive Note & CTA */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl text-xs text-blue-200">
                    <p className="font-semibold text-blue-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Live Hackathon Demo Available</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Experience the full system with real role logins for Citizens and Municipal Authorities.
                    </p>
                  </div>

                  <Link to="/demo" className="block">
                    <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer">
                      <span>Launch Command Center Demo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FINAL CALL TO ACTION BANNER
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-[#0B132B] py-20 px-4 text-center text-white border-t border-blue-900">
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 backdrop-blur-md">
            <span>SMART REWA 2030 INITIATIVE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Ready to experience Rewa’s next-generation civic intelligence?
          </h2>

          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Test the live platform as a citizen reporting local issues, or as a municipal officer managing city-wide response.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <Link to="/demo" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 px-8 py-3.5 rounded-xl text-base font-bold shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
                Try Interactive Demo
              </button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-blue-900/60 hover:bg-blue-900 text-white border border-white/30 px-8 py-3.5 rounded-xl text-base font-semibold backdrop-blur-md transition-all cursor-pointer">
                Sign In to Platform
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
