import React from 'react';
import { Brain, GitMerge, AlertTriangle, CheckCircle } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-[#0F172A] mb-4">How RiWA Works</h1>
          <p className="text-xl text-[#475569]">
            From a citizen's complaint to a city-wide intelligence dashboard.
          </p>
        </div>

        <div className="space-y-24">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#2563EB] text-sm font-bold">
                <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center">1</span>
                AI Understanding
              </div>
              <h2 className="text-3xl font-bold text-[#0F172A]">Structuring the Unstructured</h2>
              <p className="text-[#475569] text-lg">
                When a citizen submits a report, it's often messy, colloquial, or incomplete. RiWA's NLP engine instantly parses the text to extract key entities like location, severity, and category.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle className="w-5 h-5 text-green-500" /> Automatically categorizes the issue</li>
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle className="w-5 h-5 text-green-500" /> Extracts precise geospatial coordinates</li>
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle className="w-5 h-5 text-green-500" /> Determines initial severity score</li>
              </ul>
            </div>
            <div className="flex-1 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
              <Brain className="w-16 h-16 text-[#2563EB] mx-auto mb-4" />
              <div className="bg-slate-50 p-4 rounded text-sm text-slate-700 italic mb-4">
                "Water is totally flooded near the central market since morning, nobody can pass."
              </div>
              <div className="space-y-2 text-xs font-mono bg-blue-50 p-4 rounded text-blue-800">
                <div>category: WATERLOGGING</div>
                <div>location: CENTRAL MARKET</div>
                <div>severity: HIGH</div>
                <div>impact: TRAFFIC BLOCKED</div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-[#06B6D4] text-sm font-bold">
                <span className="w-6 h-6 rounded-full bg-[#06B6D4] text-white flex items-center justify-center">2</span>
                Semantic Fusion
              </div>
              <h2 className="text-3xl font-bold text-[#0F172A]">Connecting the Dots</h2>
              <p className="text-[#475569] text-lg">
                Multiple citizens often report the same issue. Instead of overwhelming the dashboard with duplicates, RiWA fuses related reports together based on time, location, and semantic similarity.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle className="w-5 h-5 text-cyan-500" /> Reduces noise for authorities</li>
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle className="w-5 h-5 text-cyan-500" /> Groups reports into a unified Incident</li>
                <li className="flex items-center gap-2 text-slate-600"><CheckCircle className="w-5 h-5 text-cyan-500" /> Corroborates severity using multiple sources</li>
              </ul>
            </div>
            <div className="flex-1 bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center">
              <GitMerge className="w-16 h-16 text-[#06B6D4] mx-auto mb-4" />
              <div className="flex justify-center gap-2 mb-4">
                <div className="w-12 h-16 bg-slate-100 rounded border border-slate-200"></div>
                <div className="w-12 h-16 bg-slate-100 rounded border border-slate-200"></div>
                <div className="w-12 h-16 bg-slate-100 rounded border border-slate-200"></div>
              </div>
              <div className="text-lg font-bold text-slate-800">1 Unified Incident</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-bold">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center">3</span>
                Prioritization
              </div>
              <h2 className="text-3xl font-bold text-[#0F172A]">Focus on What Matters</h2>
              <p className="text-[#475569] text-lg">
                Not all incidents are created equal. RiWA calculates a dynamic priority score based on the number of reports, the predicted impact, and historical context.
              </p>
            </div>
            <div className="flex-1 bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center">
              <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-orange-400 to-red-600 h-full w-[85%]"></div>
              </div>
              <div className="mt-2 text-sm font-bold text-red-600">CRITICAL PRIORITY</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
