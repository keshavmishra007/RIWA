import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Play, User, Shield, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const DemoPage: React.FC = () => {
  const { loginAsRole } = useAuth();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleQuickLogin = async (role: 'CITIZEN' | 'AUTHORITY') => {
    setLoadingRole(role);
    try {
      const success = await loginAsRole(role);
      if (success) {
        if (role === 'CITIZEN') {
          navigate('/citizen/dashboard');
        } else {
          navigate('/authority/dashboard');
        }
      }
    } catch (err) {
      console.error('Demo login failed:', err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Interactive Demo</h1>
          <p className="text-[#475569] mb-8">
            Experience RiWA from both the citizen's perspective and the authority's command center.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Citizen Persona */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-[#2563EB] transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <User className="text-[#2563EB] w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Citizen Experience</h2>
              <p className="text-slate-600 mb-6 text-sm">
                Submit reports, upload photos, and track the status of issues you've reported in your neighborhood.
              </p>
              <Button 
                onClick={() => handleQuickLogin('CITIZEN')}
                disabled={loadingRole !== null}
                className="w-full bg-white text-[#2563EB] border border-[#2563EB] hover:bg-blue-50 flex items-center justify-center gap-2"
              >
                {loadingRole === 'CITIZEN' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                  </>
                ) : (
                  'Quick Login as Citizen'
                )}
              </Button>
            </div>

            {/* Authority Persona */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:border-[#0F172A] transition-colors">
              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-slate-700 w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Command Center</h2>
              <p className="text-slate-600 mb-6 text-sm">
                View AI-fused incidents, manage priorities, dispatch resources, and monitor city-wide metrics.
              </p>
              <Button 
                onClick={() => handleQuickLogin('AUTHORITY')}
                disabled={loadingRole !== null}
                className="w-full bg-[#0F172A] text-white hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                {loadingRole === 'AUTHORITY' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                  </>
                ) : (
                  'Quick Login as Authority'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Demo Scenario Launcher */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <Play className="text-[#2563EB] w-6 h-6" />
            <h2 className="text-2xl font-bold text-[#0F172A]">Demo Scenarios</h2>
          </div>
          
          <div className="border border-slate-200 rounded-lg p-6 bg-blue-50/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Scenario 1: Waterlogging Storm</h3>
                <p className="text-sm text-slate-600">Simulates 3 citizens reporting the same flooded street.</p>
              </div>
              <select className="mt-4 md:mt-0 p-2 border border-slate-300 rounded bg-white text-sm">
                <option>Waterlogging Scenario</option>
                <option disabled>Pothole Cluster (Coming Soon)</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded border border-slate-200 flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">Submit Report 1</div>
                  <div className="text-xs text-slate-500">"Road flooded near Main St..."</div>
                </div>
                <Button size="sm" variant="secondary">Simulate</Button>
              </div>
              <div className="bg-white p-4 rounded border border-slate-200 flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">Submit Report 2</div>
                  <div className="text-xs text-slate-500">"Water entering shops..."</div>
                </div>
                <Button size="sm" variant="secondary">Simulate</Button>
              </div>
              <div className="bg-white p-4 rounded border border-slate-200 flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">Submit Report 3</div>
                  <div className="text-xs text-slate-500">"Traffic stuck due to water..."</div>
                </div>
                <Button size="sm" variant="secondary">Simulate</Button>
              </div>
            </div>

            <div className="mt-6">
              <Button className="w-full bg-[#2563EB] text-white hover:bg-blue-700">
                LOAD DEMO SCENARIO
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
