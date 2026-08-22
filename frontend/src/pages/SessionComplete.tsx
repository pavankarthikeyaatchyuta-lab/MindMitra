import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Activity, Home, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SessionComplete() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10"
    >
      <div className="cosmic-card p-8 sm:p-12 max-w-2xl w-full text-center relative overflow-hidden shadow-2xl">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            <Sparkles size={48} className="text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Great Exploration Today!
          </h1>

          <p className="text-xl sm:text-2xl text-slate-200 mb-8 leading-relaxed max-w-lg mx-auto">
            You've completed all 4 cognitive activities for today.
            Exercising memory and attention is a wonderful daily habit.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="elderly-btn-secondary flex items-center justify-center gap-2 text-xl"
            >
              <Home size={22} /> Return Home
            </button>

            <button
              onClick={() => navigate('/caregiver')}
              className="elderly-btn-primary flex items-center justify-center gap-2 text-xl"
            >
              <Activity size={22} /> View Caregiver Insights <ArrowRight size={22} />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-indigo-400" />
            Prototype behavioral insight — not a medical diagnosis.
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
