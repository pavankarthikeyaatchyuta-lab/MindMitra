import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  ArrowLeft, 
  ArrowRight, 
  Cpu, 
  TrendingUp, 
  HeartHandshake, 
  ListOrdered, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Users, 
  Activity, 
  Layers, 
  Clock 
} from 'lucide-react';
import CaregiverAccountMenu from '../components/CaregiverAccountMenu';
import { useApp } from '../context/AppContext';

export default function HowItWorks() {
  const navigate = useNavigate();
  const { caregiver } = useApp();

  return (
    <div className="min-h-screen relative z-10 flex flex-col text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-indigo-500/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-900 border border-indigo-500/20 text-slate-300 hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow">
                <Brain size={20} />
              </div>
              <span className="text-lg font-bold text-white">MindMitra</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {caregiver ? (
              <CaregiverAccountMenu />
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow transition-all"
              >
                Caregiver Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex-grow">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Layers size={14} className="text-indigo-400" />
            <span>Product Architecture & Cognitive Science</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            How MindMitra Works
          </h1>
          <p className="text-slate-300 text-base sm:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
            A comprehensive overview of MindMitra's cognitive activities, machine-learning adaptive engine, longitudinal trend math, and explainable AI insights.
          </p>
        </div>

        {/* Step 1: Cognitive Exercises */}
        <section className="mb-16 cosmic-card p-8 border border-indigo-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold">
              01
            </div>
            <h2 className="text-2xl font-bold text-white">Engaging, Dignified Cognitive Exercises</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Four activities target specific cognitive domains without causing clinical anxiety or feeling like medical tests:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/20">
              <strong className="text-white text-sm block mb-1">1. Memory Match</strong>
              <span className="text-indigo-300 font-semibold block mb-1.5">Short-Term Memory</span>
              <p className="text-slate-400">Card-matching exercise assessing working memory latency, card flip frequency, and repeat error counts.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/20">
              <strong className="text-white text-sm block mb-1">2. Daily Routine Recall</strong>
              <span className="text-indigo-300 font-semibold block mb-1.5">Sequential & Episodic Memory</span>
              <p className="text-slate-400">Chronological re-ordering of everyday tasks (morning tea, medication, walking, dinner) evaluating logical procedural memory.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/20">
              <strong className="text-white text-sm block mb-1">3. Object & Face Recognition</strong>
              <span className="text-indigo-300 font-semibold block mb-1.5">Visual & Familiar-Person Recognition</span>
              <p className="text-slate-400">Household item recognition combined with private, caregiver-uploaded photographs of family members and loved ones.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/20">
              <strong className="text-white text-sm block mb-1">4. Pattern Recall</strong>
              <span className="text-indigo-300 font-semibold block mb-1.5">Pattern Recognition & Attention</span>
              <p className="text-slate-400">Pattern progression and symbol recognition measuring sustained attention and cognitive flexibility.</p>
            </div>
          </div>
        </section>

        {/* Step 2: Telemetry & Adaptive RandomForest Model */}
        <section className="mb-16 cosmic-card p-8 border border-indigo-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-bold">
              02
            </div>
            <h2 className="text-2xl font-bold text-white">Real-Time Telemetry & Adaptive ML</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            During each activity, MindMitra silently records 7 granular behavioral telemetry signals:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-6">
            {[
              { label: 'Accuracy', value: 'Correct %' },
              { label: 'Response Latency', value: 'Mean Time (ms)' },
              { label: 'Latency Variance', value: 'Consistency' },
              { label: 'Repeat Errors', value: 'Error Frequency' },
              { label: 'Correction Rate', value: 'Self-Adjustment' },
              { label: 'Completion Time', value: 'Overall Duration' },
              { label: 'Current Level', value: 'Difficulty 1-5' },
              { label: 'Recent Trend', value: 'Slope Δ' },
            ].map((f, i) => (
              <div key={i} className="p-3 bg-slate-900 rounded-xl border border-indigo-500/20">
                <div className="text-xs font-bold text-white">{f.label}</div>
                <div className="text-[10px] text-indigo-300 mt-0.5">{f.value}</div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block mb-1">RandomForest Classifier Engine:</strong>
            Trained on 5,000+ gameplay simulations, the model outputs adaptive recommendations (<span className="text-emerald-400 font-bold">INCREASE</span>, <span className="text-blue-400 font-bold">MAINTAIN</span>, or <span className="text-amber-400 font-bold">DECREASE</span>) along with transparent feature importances and confidence scores.
          </div>
        </section>

        {/* Step 3: Personal Baselines & Longitudinal Trends */}
        <section className="mb-16 cosmic-card p-8 border border-indigo-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold">
              03
            </div>
            <h2 className="text-2xl font-bold text-white">Personal Baselines & Trend Analysis</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Instead of comparing elderly users against generic population standards, MindMitra establishes a <strong>personalized baseline</strong> using the median and interquartile range over the senior's last 5-10 sessions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30">
              <span className="text-emerald-300 font-bold block mb-1">Stable Pattern</span>
              <p className="text-slate-400">Current accuracy within established personal median range ($\pm 10\%$). Difficulty smoothly adjusted.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30">
              <span className="text-amber-300 font-bold block mb-1">Recent Change Observation</span>
              <p className="text-slate-400">Persistent drop below baseline across $\ge 2$ consecutive eligible sessions at the same or lower difficulty.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/30">
              <span className="text-blue-300 font-bold block mb-1">Improving Trajectory</span>
              <p className="text-slate-400">Consistent performance progression and prompt response times exceeding established baseline.</p>
            </div>
          </div>
        </section>

        {/* Step 4: Caregiver Explainable AI & Routine Reminders */}
        <section className="cosmic-card p-8 border border-indigo-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-pink-600/30 border border-pink-400/40 flex items-center justify-center text-pink-300 font-bold">
              04
            </div>
            <h2 className="text-2xl font-bold text-white">Explainable AI Insights & Caregiver Support</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            MindMitra converts raw metrics into clear, actionable, structured explanations for caregivers without medical jargon:
          </p>

          <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/20 text-xs space-y-2">
            <div className="flex items-center justify-between text-indigo-300 font-bold">
              <span>Structured Insight Format</span>
              <span className="text-[10px] text-slate-500">Gemini 2.0 Flash + Deterministic Guardrails</span>
            </div>
            <p className="text-slate-300"><strong className="text-white">1. What Changed:</strong> Identification of the specific domain and baseline deviation.</p>
            <p className="text-slate-300"><strong className="text-white">2. Why Highlighted:</strong> Evidence delta (e.g. 3 of last 4 sessions below baseline, +29% response latency).</p>
            <p className="text-slate-300"><strong className="text-white">3. Interpretation:</strong> Plain-language behavioral observation explaining that this indicates recent game variation, not a clinical diagnosis.</p>
            <p className="text-slate-300"><strong className="text-white">4. Suggested Action:</strong> Recommends continued observation or discussing persistent patterns with healthcare professionals.</p>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-base font-bold shadow-xl shadow-indigo-600/25"
          >
            <span>Experience MindMitra Now</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-indigo-500/20 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 MindMitra. Designed for dignified cognitive wellbeing and caregiver assistance.</p>
      </footer>
    </div>
  );
}
