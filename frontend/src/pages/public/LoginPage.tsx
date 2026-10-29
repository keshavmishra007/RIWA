import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { AlertCircle, Activity, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAsRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Read authenticated role from localStorage
        const stored = localStorage.getItem('riwa_auth');
        const role = stored ? JSON.parse(stored).user?.role : undefined;

        if (role === 'AUTHORITY' || role === 'ADMIN' || email.includes('authority') || email.includes('admin')) {
          navigate('/authority/dashboard');
        } else {
          navigate('/citizen/dashboard');
        }
      } else {
        setError('Invalid email or password.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async (role: 'CITIZEN' | 'AUTHORITY' | 'ADMIN', demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
    setIsLoading(true);

    try {
      const success = await loginAsRole(role);
      if (success) {
        if (role === 'AUTHORITY' || role === 'ADMIN') navigate('/authority/dashboard');
        else navigate('/citizen/dashboard');
      } else {
        setError(`Failed to log in as ${role.toLowerCase()}.`);
      }
    } catch {
      setError(`Failed to log in as ${role.toLowerCase()}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* LEFT: Branding Column */}
      <div className="md:w-1/2 bg-gradient-to-br from-[#2563EB] to-[#0F172A] text-white p-12 flex flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <Activity className="w-8 h-8 text-cyan-400" />
            <span className="text-3xl font-bold tracking-tight">RiWA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Civic intelligence for a more responsive city.
          </h1>
          <p className="text-blue-200 text-lg max-w-md">
            Sign in to access your customized dashboard and monitor civic incidents in real-time.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-24 -right-24 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      {/* RIGHT: Form Column */}
      <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Welcome back</h2>
            <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-[#2563EB] focus:border-[#2563EB] outline-none"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-[#2563EB] focus:border-[#2563EB] outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-2 rounded-md flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#2563EB] font-semibold hover:underline">
                Create account
              </Link>
            </div>
          </form>

          {/* Demo Login Section */}
          <div className="pt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500 font-medium">1-Click Demo Accounts</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleDemoClick('CITIZEN', 'citizen@riwa.demo')}
                className="p-3 border border-slate-200 rounded-md hover:border-[#2563EB] hover:bg-blue-50 transition-colors text-center"
              >
                <div className="font-semibold text-sm text-[#0F172A]">Citizen</div>
                <div className="text-xs text-slate-500 mt-1 truncate">citizen@riwa.demo</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('AUTHORITY', 'authority@riwa.demo')}
                className="p-3 border border-slate-200 rounded-md hover:border-[#2563EB] hover:bg-blue-50 transition-colors text-center"
              >
                <div className="font-semibold text-sm text-[#0F172A]">Authority</div>
                <div className="text-xs text-slate-500 mt-1 truncate">authority@riwa.demo</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('ADMIN', 'admin@riwa.demo')}
                className="p-3 border border-slate-200 rounded-md hover:border-[#2563EB] hover:bg-blue-50 transition-colors text-center"
              >
                <div className="font-semibold text-sm text-[#0F172A]">Admin</div>
                <div className="text-xs text-slate-500 mt-1 truncate">admin@riwa.demo</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
