import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, ShieldCheck, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isRegister) {
      if (!name.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }
      const success = await register(name, email, password);
      if (success) {
        navigate('/profiles');
      } else {
        setError('Registration failed. Email may already be in use.');
      }
    } else {
      const success = await login(email, password);
      if (success) {
        navigate('/profiles');
      } else {
        setError('Invalid email or password.');
      }
    }
    setLoading(false);
  };

  const handleQuickDemo = async () => {
    setEmail('pavan@mindmitra.com');
    setPassword('mindmitra123');
    setLoading(true);
    const success = await login('pavan@mindmitra.com', 'mindmitra123');
    if (success) {
      navigate('/profiles');
    } else {
      setError('Could not connect to backend server. Please verify backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-150 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-sm mb-3 text-white hover:bg-blue-700 transition-colors">
            <Brain size={32} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">MindMitra</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Caregiver Portal & Cognitive Support</p>
        </div>

        {/* Login Card */}
        <div className="card p-7 shadow-sm">
          <div className="flex border-b border-slate-200 dark:border-slate-700 pb-3 mb-6">
            <button
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 pb-2 text-center text-sm font-bold transition-colors ${
                !isRegister ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 pb-2 text-center text-sm font-bold transition-colors ${
                isRegister ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Register Caregiver
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Caregiver Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sunita Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="caregiver@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="elderly-btn-primary w-full text-base py-3 rounded-xl mt-2 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Create Caregiver Account' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Demonstration Quick Access */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1.5"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Fill Demo Caregiver Account (1-Click)</span>
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
