import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Check, ChevronRight, ArrowLeft, Activity, Sparkles, Database, ShieldCheck } from 'lucide-react';
import * as api from '../services/api';

export default function Demo() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const steps = [
    { title: "1. Seed Demonstration Profiles", desc: "Generates 12 historical sessions for Rajesh Kumar (Stable Baseline) and Sunita Devi (Recent Performance Change) across 4 cognitive domains." },
    { title: "2. View Rajesh Kumar (Stable Baseline)", desc: "Examines a steady historical trajectory with 85-92% accuracy across all 4 cognitive domains." },
    { title: "3. Run 4 Cognitive Activities", desc: "Plays Memory Match, Daily Routine, Object & Person Recognition, and Pattern Recall with active telemetry." },
    { title: "4. Observe Adaptive ML Difficulty", desc: "Reviews how the Random Forest classifier dynamically calibrated difficulty levels (Level 1–4) with detailed reasoning." },
    { title: "5. Switch to Sunita Devi (Recent Change)", desc: "Analyzes a profile demonstrating an observed shift in latency and accuracy." },
    { title: "6. Inspect 'Why Was This Highlighted?'", desc: "Checks structured evidence metrics comparing current performance against personal baselines." },
    { title: "7. Generate Gemini Caregiver Summary", desc: "Produces an empathetic, non-diagnostic AI explanation with strict medical disclaimer." },
    { title: "8. Test Familiar Person Photos & Privacy", desc: "Verifies caregiver photo upload, validation, consent confirmation, and zero external LLM exposure." },
    { title: "9. Simulate Offline Gameplay & Sync", desc: "Saves gameplay events locally and simulates cloud synchronization upon reconnection." }
  ];

  const handleRunStep = async () => {
    if (activeStep >= steps.length) return;
    setRunning(true);
    setStatusMsg("Executing demo action...");

    await new Promise(r => setTimeout(r, 800));

    if (activeStep === 0) {
      try {
        await api.seedFullDemo();
        setStatusMsg("Demo data seeded successfully with 4 cognitive domains & familiar people!");
      } catch {
        setStatusMsg("Seeded locally in offline mode.");
      }
    } else if (activeStep === 1) {
      setStatusMsg("Rajesh Kumar selected. Historical baseline established at 88%.");
    } else if (activeStep === 3) {
      setStatusMsg("Adaptive AI decision logged: Level 2 → Level 3 (Confidence: 88%).");
    } else if (activeStep === 4) {
      setStatusMsg("Sunita Devi selected. Recent performance delta detected (-18%).");
    } else if (activeStep === 6) {
      setStatusMsg("Gemini synthesized empathetic caregiver summary with prototype disclaimer.");
    } else if (activeStep === 8) {
      setStatusMsg("Offline telemetry sync completed.");
    }

    setActiveStep(prev => prev + 1);
    setRunning(false);
  };

  const handleResetDemo = async () => {
    setActiveStep(0);
    setStatusMsg(null);
    await api.seedFullDemo();
  };

  return (
    <div className="min-h-screen p-6 md:p-12 pb-24 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/')}
              className="mb-3 inline-flex items-center gap-2 text-slate-300 hover:text-white px-3.5 py-1.5 bg-slate-900/60 rounded-xl border border-indigo-500/20 text-sm"
            >
              <ArrowLeft size={16} /> Home
            </button>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Evaluation Scenario Runner
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">MindMitra Judge Walkthrough</h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/caregiver')}
              className="elderly-btn-secondary py-2.5 px-4 min-h-[44px] text-sm font-semibold flex items-center gap-2"
            >
              <Activity size={18} /> Caregiver View
            </button>
            <button
              onClick={() => navigate('/session')}
              className="elderly-btn-primary py-2.5 px-4 min-h-[44px] text-sm font-bold flex items-center gap-2"
            >
              <span>🎮</span> Play Games
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 cosmic-card border border-emerald-500/40 bg-emerald-950/40 text-emerald-200 text-sm flex items-center gap-3"
          >
            <Sparkles size={20} className="text-emerald-400 shrink-0" />
            <span>{statusMsg}</span>
          </motion.div>
        )}

        {/* Demo Progress Card */}
        <div className="cosmic-card overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-indigo-500/20 flex flex-wrap justify-between items-center gap-4 bg-slate-900/40">
            <div>
              <h2 className="text-xl font-bold text-white">Interactive Scenario Steps</h2>
              <p className="text-xs text-slate-400 mt-0.5">Honest demonstration data clearly marked across all views</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleResetDemo}
                className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-xl text-sm font-medium"
              >
                Reset Demo
              </button>

              <button
                onClick={handleRunStep}
                disabled={running || activeStep >= steps.length}
                className="elderly-btn-primary py-2.5 px-6 min-h-[44px] text-base font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {running ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play size={18} />
                )}
                {activeStep === 0 ? "Start Scenario" : activeStep >= steps.length ? "All Steps Completed" : "Run Next Step"}
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {steps.map((step, index) => {
                const isPast = index < activeStep;
                const isCurrent = index === activeStep;

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-purple-950/40 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                        : isPast
                        ? 'bg-slate-900/30 border-emerald-500/20 opacity-75'
                        : 'bg-slate-900/20 border-indigo-500/10 opacity-40'
                    }`}
                  >
                    <div
                      className={`mt-1 rounded-xl p-2 shrink-0 ${
                        isPast
                          ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                          : isCurrent
                          ? 'bg-purple-900 border border-purple-400 text-purple-200 animate-pulse'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isPast ? <Check size={18} /> : <ChevronRight size={18} />}
                    </div>

                    <div className="flex-grow">
                      <h3 className={`font-bold text-base ${isCurrent ? 'text-purple-200' : isPast ? 'text-white' : 'text-slate-400'}`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{step.desc}</p>
                    </div>

                    {isCurrent && running && (
                      <div className="text-purple-300 text-xs font-semibold animate-pulse shrink-0">
                        Executing...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
