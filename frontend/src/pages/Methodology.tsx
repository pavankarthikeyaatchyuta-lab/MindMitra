import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Settings, ShieldCheck, Database, LayoutDashboard, CloudOff, ArrowLeft, Sparkles, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Methodology() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 md:p-12 pb-24 relative z-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <button
            onClick={() => navigate('/')}
            className="mb-4 inline-flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2 bg-slate-900/60 rounded-xl border border-indigo-500/20"
          >
            <ArrowLeft size={20} /> Back to Welcome
          </button>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Architecture & AI Methodology
          </h1>
          <p className="text-xl text-indigo-200 max-w-3xl mx-auto font-light">
            "Exploring the mind like exploring a universe" — Combining engineered healthcare guardrails with adaptive machine learning.
          </p>
        </header>

        {/* 4 Cognitive Games Mapping Banner */}
        <div className="cosmic-card p-6 mb-10 border border-indigo-500/30">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-amber-400" />
            4 Core Cognitive Activities (MVP Specification)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-indigo-500/20">
              <div className="text-2xl mb-1">🧠</div>
              <h3 className="font-bold text-white text-base">1. Memory Match</h3>
              <p className="text-xs text-indigo-300 font-medium">Domain: Short-Term Memory</p>
              <p className="text-xs text-slate-400 mt-1">Evaluates card pair retention, latency, and repeat mistake rates.</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-indigo-500/20">
              <div className="text-2xl mb-1">📋</div>
              <h3 className="font-bold text-white text-base">2. Daily Routine Recall</h3>
              <p className="text-xs text-indigo-300 font-medium">Domain: Sequential Memory</p>
              <p className="text-xs text-slate-400 mt-1">Memorize-and-recall sequence task measuring temporal ordering.</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-indigo-500/20">
              <div className="text-2xl mb-1">🔍</div>
              <h3 className="font-bold text-white text-base">3. Object & Person Recognition</h3>
              <p className="text-xs text-indigo-300 font-medium">Domain: Visual & Person Recognition</p>
              <p className="text-xs text-slate-400 mt-1">Label-free visual identification and familiar caregiver photos.</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-indigo-500/20">
              <div className="text-2xl mb-1">✨</div>
              <h3 className="font-bold text-white text-base">4. Pattern Recall</h3>
              <p className="text-xs text-indigo-300 font-medium">Domain: Pattern & Attention</p>
              <p className="text-xs text-slate-400 mt-1">Constellation structure recognition with distractor patterns.</p>
            </div>
          </div>
        </div>

        {/* AI/ML vs Engineered Architecture */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* AI / Machine Learning Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cosmic-card p-8 border border-purple-500/30"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-purple-950/80 border border-purple-400/40 text-purple-300 rounded-2xl">
                <BrainCircuit size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI & Machine Learning</h2>
                <p className="text-sm text-purple-200">Adaptive Intelligence & Explainability</p>
              </div>
            </div>

            <ul className="space-y-5">
              <li className="flex gap-3">
                <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0 shadow-[0_0_8px_#c084fc]" />
                <div>
                  <h3 className="text-lg font-bold text-white">Adaptive Difficulty Engine (Random Forest)</h3>
                  <p className="text-slate-300 text-sm mt-0.5">
                    A multi-class classifier trained on 5,000+ telemetry vectors analyzes response latency, error variance, and accuracy to adjust challenge levels (Level 1–4) without user frustration.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0 shadow-[0_0_8px_#c084fc]" />
                <div>
                  <h3 className="text-lg font-bold text-white">Fine-Grained Behavioral Telemetry</h3>
                  <p className="text-slate-300 text-sm mt-0.5">
                    Extracts subtle interaction metrics beyond pure score: reaction latency (ms), hesitation time, repeat confusion, and self-correction attempts.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0 shadow-[0_0_8px_#c084fc]" />
                <div>
                  <h3 className="text-lg font-bold text-white">Empathetic Caregiver Explainability (Gemini)</h3>
                  <p className="text-slate-300 text-sm mt-0.5">
                    Converts statistical telemetry deltas into clear, compassionate caregiver insights without sending sensitive personal photos to external LLM APIs.
                  </p>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* Engineered Systems Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="cosmic-card p-8 border border-blue-500/30"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-blue-950/80 border border-blue-400/40 text-blue-300 rounded-2xl">
                <Settings size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Engineered Systems</h2>
                <p className="text-sm text-blue-200">Clinical Guardrails & Accessibility</p>
              </div>
            </div>

            <ul className="space-y-5">
              <li className="flex gap-3">
                <ShieldCheck className="text-emerald-400 shrink-0 mt-1" size={22} />
                <div>
                  <h3 className="text-lg font-bold text-white">Personal Moving Baseline Engine</h3>
                  <p className="text-slate-300 text-sm mt-0.5">
                    Calculates rolling averages over 5–10 historical sessions. Strictly prevents clinical diagnostic claims while highlighting meaningful deviations for caregiver awareness.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <LayoutDashboard className="text-blue-400 shrink-0 mt-1" size={22} />
                <div>
                  <h3 className="text-lg font-bold text-white">Inclusive Elderly-First UX</h3>
                  <p className="text-slate-300 text-sm mt-0.5">
                    Large 48px+ touch targets, 18px+ base typography, calm animations, bilingual (English & Hindi) dictionaries, and optional speech synthesis.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <CloudOff className="text-indigo-400 shrink-0 mt-1" size={22} />
                <div>
                  <h3 className="text-lg font-bold text-white">Offline-First Local Storage</h3>
                  <p className="text-slate-300 text-sm mt-0.5">
                    Client-side persistence queues telemetry during connectivity interruptions, maintaining seamless gameplay and synchronization.
                  </p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
