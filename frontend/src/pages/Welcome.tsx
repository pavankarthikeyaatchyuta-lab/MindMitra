import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useApp } from '../context/AppContext';
import { 
  Brain, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  HeartHandshake, 
  Cpu, 
  TrendingUp, 
  Eye, 
  ListOrdered, 
  HelpCircle, 
  CheckCircle2, 
  Lock, 
  Volume2, 
  Globe, 
  Compass, 
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Welcome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { caregiver } = useApp();

  const [activeFeatureTab, setActiveFeatureTab] = useState<'play' | 'adapt' | 'track' | 'support'>('play');

  const handleGetStarted = () => {
    if (caregiver) {
      navigate('/profiles');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen relative z-10 flex flex-col text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* 1. Global Public Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-indigo-500/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Brain size={24} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                MindMitra <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <span className="text-[10px] text-indigo-300 font-medium block">Cognitive Wellbeing Companion</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to="/how-it-works" className="hover:text-indigo-300 transition-colors">How It Works</Link>
            <Link to="/methodology" className="hover:text-indigo-300 transition-colors">Architecture & AI</Link>
            <Link to="/demo" className="hover:text-indigo-300 transition-colors flex items-center gap-1.5">
              <Sparkles size={15} className="text-amber-400" />
              <span>Judge Demo</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {caregiver ? (
              <Link
                to="/profiles"
                className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow"
              >
                <Users size={16} />
                <span>My Profiles</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-indigo-500/30 text-slate-200 text-xs sm:text-sm font-semibold transition-all"
              >
                Caregiver Sign In
              </Link>
            )}

            <button
              onClick={handleGetStarted}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-16 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-inner"
        >
          <Sparkles size={14} className="text-amber-400" />
          <span>AI-Powered Cognitive Engagement & Caregiver Support</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl"
        >
          Personalized cognitive support, <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">built around the person.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl leading-relaxed"
        >
          MindMitra combines engaging, dignified cognitive activities, adaptive machine-learning difficulty, longitudinal behavioral tracking, and explainable AI insights in one accessible platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={handleGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white text-lg font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group transition-all"
          >
            <span>Start Exploring MindMitra</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <Link
            to="/how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-indigo-500/30 hover:border-indigo-400 text-slate-200 text-lg font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Compass size={20} className="text-indigo-400" />
            <span>Explore How It Works</span>
          </Link>
        </motion.div>

        {/* Guided Demo Access */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 text-xs sm:text-sm text-slate-300 shadow-lg"
        >
          <Sparkles size={16} className="text-amber-400" />
          <span className="font-medium text-slate-300">Looking for a quick demonstration walkthrough?</span>
          <Link
            to="/demo"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/70 border border-indigo-400/40 text-indigo-200 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow"
          >
            <span>Enter Guided Demo Mode</span>
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </section>

      {/* 3. Core Product Loop (Play -> Adapt -> Track -> Support) */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">The MindMitra Cognitive Wellness Loop</h2>
          <p className="text-slate-400 text-sm mt-2">Continuous non-invasive engagement that learns and supports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              id: 'play',
              step: '01',
              title: 'PLAY',
              subtitle: 'Dignified Cognitive Activities',
              desc: '4 tailored exercises measuring short-term memory, daily routine recall, visual recognition, and pattern attention.',
              icon: Brain,
              color: 'from-blue-500 to-indigo-600',
            },
            {
              id: 'adapt',
              step: '02',
              title: 'ADAPT',
              subtitle: 'RandomForest Difficulty Model',
              desc: 'Telemetry analyzes response latency, repeat errors, and corrections to adjust challenge dynamically without frustration.',
              icon: Cpu,
              color: 'from-indigo-500 to-purple-600',
            },
            {
              id: 'track',
              step: '03',
              title: 'TRACK',
              subtitle: 'Personal Baseline & Trends',
              desc: 'Compares current sessions against established personal baselines over 5-10 sessions rather than rigid population norms.',
              icon: TrendingUp,
              color: 'from-purple-500 to-pink-600',
            },
            {
              id: 'support',
              step: '04',
              title: 'SUPPORT',
              subtitle: 'Explainable AI & Routine Aid',
              desc: 'Clear natural-language summaries for caregivers, schedule reminders, and multilingual voice companions.',
              icon: HeartHandshake,
              color: 'from-pink-500 to-rose-600',
            },
          ].map((card) => (
            <div
              key={card.id}
              onClick={() => setActiveFeatureTab(card.id as any)}
              className={`cosmic-card p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                activeFeatureTab === card.id
                  ? 'border-indigo-400 bg-indigo-950/50 shadow-xl shadow-indigo-500/10'
                  : 'border-indigo-500/20 hover:border-indigo-400/60 bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow`}>
                    <card.icon size={22} />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">{card.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">{card.title}</h3>
                <h4 className="text-xs font-semibold text-indigo-300 mt-0.5">{card.subtitle}</h4>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">{card.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-500/20 flex items-center justify-between text-xs">
                <span className="text-indigo-400 font-medium">Explore Details</span>
                <ArrowRight size={14} className="text-indigo-400" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. The 4 Core Cognitive Activities Showcase */}
      <section className="py-16 px-6 bg-slate-950/50 border-y border-indigo-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Cognitive Engagement</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Four Purpose-Built Activities</h2>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              Designed specifically for seniors with large touch targets, dignified graphics, and zero clinical anxiety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Memory Match',
                domain: 'Short-Term Memory',
                desc: 'Pair familiar cards to exercise visual working memory and spatial recall.',
                icon: Brain,
                telemetry: 'Flips, latency variance, repeat errors',
              },
              {
                title: 'Daily Routine Recall',
                domain: 'Sequential & Episodic Memory',
                desc: 'Reorder daily life activities in logical morning, afternoon, and evening sequences.',
                icon: ListOrdered,
                telemetry: 'Step accuracy, ordering corrections',
              },
              {
                title: 'Object & Face Recognition',
                domain: 'Visual & Familiar Recognition',
                desc: 'Identify familiar household items and personalized family member photos.',
                icon: Eye,
                telemetry: 'Recognition speed, visual confusions',
              },
              {
                title: 'Pattern Recall',
                domain: 'Pattern Recognition & Attention',
                desc: 'Observe and complete sequences to stimulate sustained focus and attention.',
                icon: Sparkles,
                telemetry: 'Response consistency, sequence span',
              },
            ].map((game, i) => (
              <div key={i} className="cosmic-card p-6 border border-indigo-500/30 flex flex-col justify-between hover:border-indigo-400 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-indigo-500/40 flex items-center justify-center text-indigo-300 mb-4 shadow">
                    <game.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{game.title}</h3>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30">
                    {game.domain}
                  </span>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">{game.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-indigo-500/20 text-[11px] text-slate-400">
                  <span className="text-indigo-400 font-semibold">Telemetry:</span> {game.telemetry}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Built for Elderly Users & Caregiver Intelligence */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Senior Experience</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 leading-tight">
              Dignified, Accessible, and Multilingual
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed">
              MindMitra respects older adults with high contrast, large 56px+ tactile buttons, and native voice instruction in English, Hindi, and Telugu.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { title: 'Multilingual Voice Guidance', desc: 'Spoken instructions in English, Hindi, and Telugu with local speech synthesis & cloud fallback.' },
                { title: 'Dignified & Non-Childish', desc: 'Warm aesthetics inspired by cognitive wellness rather than cartoonish games or intimidating clinical tools.' },
                { title: 'Distraction-Free Mode', desc: 'Elderly gameplay hides complex caregiver dashboards to focus entirely on calm, enjoyable play.' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-900/60 border border-indigo-500/20">
                  <div className="w-8 h-8 rounded-xl bg-indigo-950 flex-shrink-0 flex items-center justify-center text-indigo-400">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cosmic-card p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Caregiver Intelligence</span>
            <h3 className="text-2xl font-bold text-white mt-1">Explainable AI Insights</h3>
            <p className="text-xs text-slate-300 mt-2">
              Transforming complex gameplay telemetry into clear, caregiver-friendly observations powered by Gemini AI and deterministic guardrails.
            </p>

            <div className="mt-6 p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Activity size={15} /> Recent Change Highlighted
                </span>
                <span className="text-[10px] text-slate-400">Sequential Routine Memory</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                "Across recent sessions, performance dropped from baseline median 84% to 72% with a 29% increase in response latency. Difficulty level was maintained."
              </p>
              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-[11px] text-indigo-200">
                <strong className="text-white">Caregiver Suggestion:</strong> Continue observing future sessions. Discuss persistent patterns with a healthcare professional.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Lock size={14} className="text-emerald-400" /> Private & Profile-Isolated
              </span>
              <span className="text-[10px] text-slate-400">Non-Diagnostic System</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Privacy & Safety Guarantees */}
      <section className="py-16 px-6 bg-slate-950/40 border-t border-indigo-500/20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-4">
            <ShieldCheck size={16} />
            <span>Ethical, Secure & Private by Design</span>
          </div>
          <h2 className="text-3xl font-bold text-white">Complete Data Isolation Between Family Profiles</h2>
          <p className="text-slate-300 text-sm mt-3 max-w-2xl mx-auto">
            One caregiver account manages multiple elderly sub-profiles. Every session, personal baseline, reminder, and familiar family photo remains strictly isolated.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 text-left">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-indigo-500/20">
              <h3 className="text-sm font-bold text-white mb-1">Non-Diagnostic Positioning</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                MindMitra tracks behavioral trends and provides engagement. It never makes medical claims or diagnoses.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-indigo-500/20">
              <h3 className="text-sm font-bold text-white mb-1">Private Photo Consent</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uploaded family photos require verified caregiver consent and remain private to that specific senior's profile.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-indigo-500/20">
              <h3 className="text-sm font-bold text-white mb-1">Offline-Resilient Architecture</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                IndexedDB queue safely captures telemetry during network interruptions and synchronizes when reconnected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <div className="cosmic-card p-10 sm:p-14 border border-indigo-500/40 shadow-2xl relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to empower your loved one's cognitive journey?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-xl mx-auto">
            Sign in as a caregiver to set up personalized elderly profiles, start daily cognitive sessions, and monitor longitudinal wellness.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight size={18} />
            </button>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-slate-200 font-semibold text-base"
            >
              Caregiver Portal
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Comprehensive Product Footer */}
      <footer className="bg-slate-950 border-t border-indigo-500/20 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10 text-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Brain size={18} />
              </div>
              <span className="text-base font-bold text-white">MindMitra</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              AI-Powered Cognitive Engagement & Caregiver Support Platform for Elderly Users.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/methodology" className="hover:text-white transition-colors">Architecture & AI</Link></li>
              <li><Link to="/demo" className="hover:text-white transition-colors">Judge Demo Flow</Link></li>
              <li><Link to="/session" className="hover:text-white transition-colors">Elderly Session Hub</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Caregiver</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/profiles" className="hover:text-white transition-colors">Profile Management</Link></li>
              <li><Link to="/caregiver" className="hover:text-white transition-colors">Caregiver Dashboard</Link></li>
              <li><Link to="/caregiver/trends" className="hover:text-white transition-colors">Longitudinal Trends</Link></li>
              <li><Link to="/caregiver/insights" className="hover:text-white transition-colors">Explainable Insights</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Security & Ethics</h4>
            <p className="text-slate-400 leading-relaxed">
              MindMitra is an assistive cognitive engagement prototype. It does not provide medical diagnosis. Always consult a healthcare professional for clinical advice.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 MindMitra. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400">Privacy Policy</span>
            <span className="hover:text-slate-400">Terms of Use</span>
            <span className="hover:text-slate-400">Non-Diagnostic Notice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
