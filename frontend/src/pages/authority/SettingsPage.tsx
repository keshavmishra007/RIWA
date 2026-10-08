import React from 'react';
import { Save, Sliders, Bell, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <p className="text-sm text-slate-500">Configure platform behaviors and preferences</p>
        </div>
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </header>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col gap-8">
        
        {/* AI Config */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">AI Configuration</h2>
          </div>
          <div className="flex flex-col gap-6 max-w-lg pl-7">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Fusion Threshold</label>
              <p className="text-sm text-slate-500 mb-3">Confidence level required to auto-merge duplicate reports</p>
              <input type="range" min="50" max="100" defaultValue="85" className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                <span>Low (50%)</span>
                <span>Balanced (85%)</span>
                <span>Strict (100%)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Priority Assignment Mode</label>
              <p className="text-sm text-slate-500 mb-2">How AI assigns incident severity levels</p>
              <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <option>Fully Automated</option>
                <option>Human-in-the-loop (Suggest only)</option>
                <option>Manual only</option>
              </select>
            </div>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Notifications */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
          </div>
          <div className="flex flex-col gap-4 pl-7">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" defaultChecked className="mt-1 rounded text-blue-600 border-slate-300 focus:ring-blue-500 w-4 h-4" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors">Alert on new Critical priority incidents</span>
                <span className="text-xs text-slate-500">Immediate push notification and email</span>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" defaultChecked className="mt-1 rounded text-blue-600 border-slate-300 focus:ring-blue-500 w-4 h-4" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors">Daily summary digest email</span>
                <span className="text-xs text-slate-500">Receive a 8:00 AM brief of yesterday's activity</span>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" defaultChecked className="mt-1 rounded text-blue-600 border-slate-300 focus:ring-blue-500 w-4 h-4" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors">Notify when department accepts assignment</span>
                <span className="text-xs text-slate-500">In-app alert when ownership changes</span>
              </div>
            </label>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* System Info */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">System Info</h2>
          </div>
          <div className="text-sm text-slate-600 flex flex-col gap-3 pl-7">
            <div className="flex items-center"><span className="w-32 font-medium text-slate-900">Version:</span> <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">v2.4.1 (Stable)</span></div>
            <div className="flex items-center"><span className="w-32 font-medium text-slate-900">Last Sync:</span> <span>Just now</span></div>
            <div className="flex items-center"><span className="w-32 font-medium text-slate-900">Environment:</span> <span className="text-green-600 font-medium">Production</span></div>
          </div>
        </section>
      </div>
    </div>
  );
};
