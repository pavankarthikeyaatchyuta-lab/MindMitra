import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useApp } from '../context/AppContext';
import ThemeToggle from '../components/ThemeToggle';
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
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-150">
      {/* 1. Global Public Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <Brain size={22} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                MindMitra
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Cognitive Wellbeing Companion</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="/how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</Link>
            <Link to="/methodology" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Architecture & AI</Link>
            <Link to="/demo" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
              <Sparkles size={15} className="text-amber-500" />
              <span>Judge Demo</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {caregiver ? (
              <Link
                to="/profiles"
                className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <Users size={15} />
                <span>My Profiles</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all"
              >
                Caregiver Sign In
              </Link>
            )}

            <button
              onClick={handleGetStarted}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-16 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-xs font-extrabold uppercase tracking-wider mb-6">
          <Sparkles size={14} className="text-blue-700 dark:text-blue-400" />
          <span>AI-Powered Cognitive Engagement & Caregiver Support</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-black dark:text-white tracking-tight leading-[1.15] max-w-4xl">
          Personalized cognitive support, <span className="text-blue-700 dark:text-blue-400">built around the person.</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-900 dark:text-slate-200 max-w-3xl leading-relaxed font-medium">
          Engaging cognitive activities, adaptive intelligence, longitudinal insights and caregiver support in one accessible platform.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={handleGetStarted}
            className="elderly-btn-primary w-full sm:w-auto text-base sm:text-lg px-8 py-3.5 flex items-center justify-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight size={18} />
          </button>

          <Link
            to="/how-it-works"
            className="elderly-btn-secondary w-full sm:w-auto text-base sm:text-lg px-8 py-3.5 flex items-center justify-center gap-2"
          >
            <Compass size={18} className="text-blue-600 dark:text-blue-400" />
            <span>How It Works</span>
          </Link>
        </div>

        {/* Guided Demo Access */}
        <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-600 dark:text-slate-300 shadow-sm">
          <Sparkles size={16} className="text-amber-500" />
          <span className="font-medium">Looking for a quick demonstration walkthrough?</span>
          <Link
            to="/demo"
            className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs inline-flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
          >
            <span>Enter Guided Demo Mode</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* 3. Core Product Loop (Play -> Adapt -> Track -> Support) */}
      <section className="py-14 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white">The MindMitra Cognitive Wellness Loop</h2>
          <p className="text-slate-900 dark:text-slate-300 text-sm font-medium mt-1.5">Continuous non-invasive engagement that learns and supports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5">
          {[
            {
              id: 'play',
              step: '01',
              title: 'PLAY',
              subtitle: 'Elderly-Friendly Tasks',
              desc: '4 dignified daily cognitive activities that respect the senior pace without stress.',
              icon: Brain,
              tag: 'Dignified Design',
            },
            {
              id: 'adapt',
              step: '02',
              title: 'ADAPT',
              subtitle: 'Machine Learning Difficulty',
              desc: 'Trained RandomForest model dynamically adjusts level (1–5) based on response speed & errors.',
              icon: Cpu,
              tag: 'ML RandomForest',
            },
            {
              id: 'track',
              step: '03',
              title: 'TRACK',
              subtitle: 'Personal Baseline Deviation',
              desc: 'Monitors longitudinal performance relative to 5–10 session historical median, not population stats.',
              icon: TrendingUp,
              tag: 'Baseline Engine',
            },
            {
              id: 'support',
              step: '04',
              title: 'SUPPORT',
              subtitle: 'Explainable AI for Caregivers',
              desc: 'Gemini 2.0 Flash synthesizes plain-language summaries with strict non-diagnostic guardrails.',
              icon: HeartHandshake,
              tag: 'Gemini 2.0 Flash',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-blue-800 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-300 dark:border-blue-800">
                      STEP {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-700 dark:text-blue-400">
                      <Icon size={20} />
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold text-black dark:text-white mb-1">{item.title}</h3>
                  <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2">{item.subtitle}</h4>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-medium leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-400 font-mono">{item.tag}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. 4 Cognitive Games Preview */}
      <section className="py-14 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white">Four Evidence-Informed Cognitive Activities</h2>
          <p className="text-slate-900 dark:text-slate-300 text-sm font-medium mt-1.5">Targeting short-term memory, sequence recall, facial recognition, and pattern attention</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'Memory Match',
              domain: 'Working & Short-Term Memory',
              desc: 'Match cards with everyday & familiar symbols to stimulate recall.',
              emoji: '🧠',
              badge: 'Visual Memory',
            },
            {
              title: 'Daily Routine Recall',
              domain: 'Sequential & Episodic Memory',
              desc: 'Reconstruct familiar daily activities and morning rituals in sequence.',
              emoji: '📋',
              badge: 'Logical Sequencing',
            },
            {
              title: 'Object & Face Recognition',
              domain: 'Visual & Facial Recognition',
              desc: 'Identify everyday objects and caregiver-uploaded family member photos.',
              emoji: '🔍',
              badge: 'Caregiver Photos',
            },
            {
              title: 'Pattern Recall',
              domain: 'Pattern Recognition & Attention',
              desc: 'Observe symbol patterns and test sustained attention and recall speed.',
              emoji: '✨',
              badge: 'Focus & Attention',
            },
          ].map((game) => (
            <div key={game.title} className="card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-2xl mb-4">
                  {game.emoji}
                </div>
                <h3 className="text-base font-extrabold text-black dark:text-white">{game.title}</h3>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-0.5">{game.domain}</p>
                <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-medium mt-2 leading-relaxed">{game.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  {game.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Multilingual & Medical Guardrails */}
      <section className="py-12 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 shrink-0">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-black dark:text-white">Multilingual & Native Voice Support</h3>
              <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-200 mt-1 leading-relaxed font-medium">
                Full localized UI and Text-to-Speech voice guidance in <strong>English</strong>, <strong>Hindi (हिंदी)</strong>, and <strong>Telugu (తెలుగు)</strong> for elderly comfort and independence.
              </p>
            </div>
          </div>

          <div className="card p-6 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-black dark:text-white">Ethical & Medical Guardrails</h3>
              <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-200 mt-1 leading-relaxed font-medium">
                MindMitra is an assistive cognitive companion and does NOT diagnose clinical dementia or disease. All insights are behavioral observations intended to support families.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 py-8 px-6 text-center text-xs text-slate-900 dark:text-slate-300 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} MindMitra — AI Companion for Cognitive Wellbeing.</p>
          <div className="flex items-center gap-4 font-bold">
            <Link to="/how-it-works" className="hover:text-blue-700 dark:hover:text-blue-400">How It Works</Link>
            <Link to="/methodology" className="hover:text-blue-700 dark:hover:text-blue-400">Methodology</Link>
            <Link to="/demo" className="hover:text-blue-700 dark:hover:text-blue-400">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
