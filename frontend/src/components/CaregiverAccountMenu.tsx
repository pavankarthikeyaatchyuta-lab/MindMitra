import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Users, KeyRound, ShieldCheck, ChevronDown, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function CaregiverAccountMenu() {
  const navigate = useNavigate();
  const { caregiver, logout } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Stop any speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    logout();
    navigate('/login');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    setLoading(true);

    try {
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordMsg({ text: 'Password successfully updated!', isError: false });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'Failed to update password. Verify current password.', isError: true });
    }
    setLoading(false);
  };

  const caregiverName = caregiver ? caregiver.name : 'Caregiver';
  const caregiverEmail = caregiver ? caregiver.email : '';

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-indigo-500/30 hover:border-indigo-400 transition-all text-left group"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
          {caregiverName.charAt(0)}
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
            {caregiverName}
          </span>
          <span className="text-[10px] text-slate-400">Caregiver Account</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950/95 border border-indigo-500/40 shadow-2xl backdrop-blur-xl z-50 p-2 animate-fadeIn text-xs">
          {/* Caregiver Info Header */}
          <div className="p-3 border-b border-indigo-500/20 mb-1">
            <p className="font-bold text-white text-sm">{caregiverName}</p>
            <p className="text-slate-400 truncate text-[11px]">{caregiverEmail}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/profiles');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-all font-medium"
          >
            <Users size={15} className="text-indigo-400" />
            <span>Profile Selection</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              setShowSettingsModal(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-all font-medium"
          >
            <Settings size={15} className="text-indigo-400" />
            <span>Account Settings</span>
          </button>

          <div className="my-1 border-t border-indigo-500/20" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-all font-bold"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Account Settings / Password Change Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="cosmic-card w-full max-w-md p-6 border border-indigo-500/40 shadow-2xl animate-fadeIn relative">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <Settings size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Caregiver Account</h3>
                <p className="text-xs text-indigo-300">Manage account credentials and security</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-indigo-500/20 mb-5 text-xs space-y-1">
              <p><strong className="text-slate-300">Name:</strong> <span className="text-white">{caregiverName}</span></p>
              <p><strong className="text-slate-300">Email:</strong> <span className="text-white">{caregiverEmail}</span></p>
              <p><strong className="text-slate-300">Account Type:</strong> <span className="text-emerald-400">Authenticated Caregiver Owner</span></p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3.5">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound size={14} /> Change Password
              </h4>

              {passwordMsg && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  passwordMsg.isError ? 'bg-red-950/60 border-red-500/40 text-red-300' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                }`}>
                  {passwordMsg.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-white text-xs focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-white text-xs focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-700 text-xs font-semibold hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
