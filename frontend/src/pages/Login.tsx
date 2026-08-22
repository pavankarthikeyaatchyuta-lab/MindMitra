import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, Heart, ShieldCheck, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

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
        setError('Invalid email or password. Try demo credentials below.');
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
      setError('Could not connect to backend server. Make sure FastAPI is running.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative z-10 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-indigo-500/20 mb-4 border border-indigo-400/30">
            <Brain size={42} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">MINDMITRA</h1>
          <p className="text-indigo-200 mt-1 text-base">Caregiver Portal & Cognitive Monitoring</p>
        </div>

        {/* Login Card */}
        <div className="cosmic-card p-8 border border-indigo-500/30 shadow-2xl">
          <div className="flex border-b border-indigo-500/20 pb-4 mb-6">
            <button
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 pb-2 text-center text-lg font-bold transition-colors ${!isRegister ? 'text-indigo-300 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}
            >
              Caregiver Login
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 pb-2 text-center text-lg font-bold transition-colors ${isRegister ? 'text-indigo-300 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Caregiver Full Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pavan Kumar"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 text-base"
                    required={isRegister}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="caregiver@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 text-base"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 text-base"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 text-base mt-2"
            >
              {loading ? (
                'Authenticating...'
              ) : isRegister ? (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-6 pt-6 border-t border-indigo-500/20 text-center">
            <p className="text-xs text-slate-400 mb-2">Hackathon / Demo Quick Access</p>
            <button
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-4 rounded-xl border border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 transition-all text-xs font-bold font-mono flex items-center justify-center gap-2"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Sign In as Demo Caregiver (Pavan Kumar)</span>
            </button>
          </div>
        </div>

        {/* Security / Privacy Footnote */}
        <div className="mt-6 text-center flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Encrypted passwords • Strict elderly profile data isolation</span>
        </div>
      </div>
    </div>
  );
}
