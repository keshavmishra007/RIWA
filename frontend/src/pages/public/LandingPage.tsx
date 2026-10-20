import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Link as LinkIcon, Shield, FileText, GitMerge, AlertTriangle, ArrowRight, Loader2, Sparkles, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
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

  // Honest illustrative fallback if live database is cold-starting or empty
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
      summary: 'Multiple citizen complaints of road damage near College Chauraha.',
      aiBrief: 'Severe potholes posing risk to two-wheelers.',
      recommendedActions: ['Dispatch road repair team'],
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
    .slice(0, 2);
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <p className="text-sm tracking-widest text-[#2563EB] uppercase font-semibold">SMART REWA 2030 · CIVIC INTELLIGENCE</p>
          <h1 className="text-5xl md:text-6xl font-bold text-[#0F172A] leading-tight">
            From scattered reports to one clear incident.
          </h1>
          <p className="text-lg text-[#475569] max-w-xl">
            RIWA uses AI to understand, connect and prioritize citizen reports—helping authorities see what is happening across the city.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/how-it-works">
              <Button className="bg-[#2563EB] hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg">
                SEE HOW IT WORKS
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="secondary" className="border-[#2563EB] text-[#2563EB] hover:bg-blue-50 px-8 py-3 rounded-md text-lg">
                VIEW LIVE DEMO
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Visualization */}
        <div className="flex-1 w-full relative h-[400px] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-transparent rounded-full blur-3xl opacity-50" />
          
          <div className="relative flex items-center justify-between w-full max-w-lg">
            {/* Input reports */}
            <div className="flex flex-col gap-4 z-10 w-40">
              <div className="bg-white p-3 rounded shadow-sm border border-slate-200 text-xs animate-pulse">Road flooded...</div>
              <div className="bg-white p-3 rounded shadow-sm border border-slate-200 text-xs animate-pulse delay-75">Water near market...</div>
              <div className="bg-white p-3 rounded shadow-sm border border-slate-200 text-xs animate-pulse delay-150">Drain overflow...</div>
            </div>

            {/* AI Fusion Box */}
            <div className="z-10 relative flex flex-col items-center">
              <div className="w-16 h-16 bg-[#2563EB] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Brain className="text-white w-8 h-8" />
              </div>
              <p className="text-xs font-bold text-[#2563EB] mt-2 tracking-wider">AI FUSION</p>
            </div>

            {/* Output Incident */}
            <div className="z-10 w-48">
              <div className="bg-white p-4 rounded-lg shadow-xl border-l-4 border-l-[#DC2626]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#DC2626] bg-red-50 px-2 py-1 rounded">CRITICAL</span>
                  <span className="text-[10px] text-slate-400">INC-104</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">Waterlogging</p>
                <p className="text-xs text-slate-500 mt-1">Market Road · 3 reports</p>
              </div>
            </div>

            {/* Connecting Lines SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 30 20 Q 50 20, 50 50" fill="none" stroke="#93C5FD" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_2s_linear_infinite]" />
              <path d="M 30 50 Q 50 50, 50 50" fill="none" stroke="#93C5FD" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_2s_linear_infinite]" />
              <path d="M 30 80 Q 50 80, 50 50" fill="none" stroke="#93C5FD" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_2s_linear_infinite]" />
              <path d="M 50 50 Q 70 50, 70 50" fill="none" stroke="#3B82F6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">
            A complaint is a signal. An incident is what the city needs to understand.
          </h2>
          <div className="flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-slate-50 p-4 border border-slate-200 rounded shadow-sm text-sm text-slate-600">Road flooded...</div>
              <div className="bg-slate-50 p-4 border border-slate-200 rounded shadow-sm text-sm text-slate-600">Water near market...</div>
              <div className="bg-slate-50 p-4 border border-slate-200 rounded shadow-sm text-sm text-slate-600">Drain overflow...</div>
              <div className="bg-slate-50 p-4 border border-slate-200 rounded shadow-sm text-sm text-slate-600">Vehicles can't pass...</div>
            </div>
            <ArrowRight className="text-[#2563EB] w-8 h-8 mb-8 rotate-90 md:rotate-0" />
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-md max-w-md w-full">
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">ONE CIVIC INCIDENT</h3>
              <p className="text-[#475569]">Waterlogging near Market Road</p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Brain className="text-[#2563EB] w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#0F172A]">UNDERSTAND</h3>
            <p className="text-[#475569]">AI extracts category, severity, location, department, and key signals from each report.</p>
            <ul className="text-sm text-[#475569] space-y-2 list-disc list-inside mt-4">
              <li>Natural Language Processing</li>
              <li>Location entity extraction</li>
              <li>Severity classification</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <LinkIcon className="text-[#06B6D4] w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#0F172A]">FUSE</h3>
            <p className="text-[#475569]">Connect related reports using meaning, location, time, and category similarity.</p>
            <ul className="text-sm text-[#475569] space-y-2 list-disc list-inside mt-4">
              <li>Semantic matching</li>
              <li>Geospatial clustering</li>
              <li>Temporal grouping</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Shield className="text-[#16A34A] w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#0F172A]">ACT</h3>
            <p className="text-[#475569]">Prioritize incidents, identify hotspots, recommend response, and track resolution.</p>
            <ul className="text-sm text-[#475569] space-y-2 list-disc list-inside mt-4">
              <li>Smart prioritization</li>
              <li>Resource allocation</li>
              <li>Automated routing</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20 px-4 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0F172A] text-center mb-16">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative gap-8 md:gap-4">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
            
            {[
              { num: '01', title: 'REPORT', desc: 'Citizen submits issue', icon: FileText },
              { num: '02', title: 'UNDERSTAND', desc: 'AI structures the report', icon: Brain },
              { num: '03', title: 'FUSE', desc: 'Related reports become one incident', icon: GitMerge },
              { num: '04', title: 'PRIORITIZE', desc: 'Authorities see what needs attention', icon: AlertTriangle }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center bg-white p-4 z-10 w-full md:w-48">
                <div className="w-16 h-16 bg-slate-50 border-2 border-blue-100 rounded-full flex items-center justify-center mb-4 text-[#2563EB]">
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-400 mb-1">{step.num}</span>
                <h4 className="font-bold text-[#0F172A] mb-2">{step.title}</h4>
                <p className="text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Authority Preview Section */}
      <section className="py-20 px-4 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">
            See what is happening before the queue becomes noise.
          </h2>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 max-w-5xl mx-auto text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Command Center Preview</h3>
                  <p className="text-xs text-slate-500">Live geographic clustering across Rewa Municipal Corporation</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {hasLiveData ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Supabase Feed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Illustrative Demo Preview
                  </span>
                )}
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                  {criticalCount} Critical
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  {activeCount} Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Working Real Leaflet Map */}
              <div className="col-span-1 md:col-span-2 relative h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
                {isLoadingData ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 text-slate-500 gap-3 z-10">
                    <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                    <span className="text-xs font-medium">Connecting to Rewa Incident Map...</span>
                  </div>
                ) : null}
                
                <CivicMap
                  incidents={displayIncidents}
                  hotspots={[]}
                  onIncidentClick={() => navigate('/demo')}
                  height="100%"
                  showLegend={false}
                  markerActionLabel="Explore in Live Demo"
                />
              </div>

              {/* Priority Incident Action Cards */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-xs text-slate-600 uppercase tracking-wider">Top Priority Incidents</h4>
                    <span className="text-[11px] text-slate-400">Rewa, MP</span>
                  </div>

                  {priorityList.map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => navigate('/demo')}
                      className={`p-3.5 rounded-lg shadow-sm border transition-all cursor-pointer hover:shadow-md hover:border-blue-400 bg-white ${
                        inc.priority === 'CRITICAL'
                          ? 'border-l-4 border-l-red-500 border-slate-200'
                          : 'border-l-4 border-l-orange-500 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-bold ${
                          inc.priority === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {inc.incidentCode || inc.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          inc.priority === 'CRITICAL' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                        }`}>
                          {inc.priority}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-800 line-clamp-1">{inc.title}</div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                        <span>{inc.reportCount} fused citizen reports</span>
                        <span className="text-blue-600 font-medium hover:underline text-[11px]">Inspect →</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100 text-xs text-blue-800">
                  <p className="font-medium">Interactive Geospatial Grid</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Click any marker on the map to inspect fused citizen reports, AI confidence, and municipal response.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <Link to="/demo">
            <Button className="bg-[#0F172A] hover:bg-slate-800 text-white px-8 py-3 rounded-md text-lg">
              EXPLORE THE COMMAND CENTER
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#2563EB] to-[#0F172A] py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-8">Ready to see civic intelligence in action?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/demo">
            <Button className="bg-white text-[#2563EB] hover:bg-blue-50 px-8 py-3 rounded-md text-lg font-semibold">
              TRY THE DEMO
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" className="border-white text-white hover:bg-white/10 px-8 py-3 rounded-md text-lg">
              SIGN IN
            </Button>
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -8; }
        }
      `}</style>
    </div>
  );
};
