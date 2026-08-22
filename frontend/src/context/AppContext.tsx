import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Caregiver, Session, GameType } from '../types';
import { LanguageProvider, useTranslation } from '../i18n';
import { api } from '../services/api';

interface AppContextType {
  caregiver: Caregiver | null;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  currentProfile: User | null;
  setCurrentProfile: (user: User | null) => void;
  switchProfile: (user: User | null) => void;
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  isOnline: boolean;
  currentDifficulty: Record<GameType, number>;
  setGameDifficulty: (gameType: GameType, difficulty: number) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const defaultDifficulty: Record<GameType, number> = {
  memory_match: 1,
  daily_routine: 1,
  object_recognition: 1,
  pattern_recall: 1,
};

const AppContext = createContext<AppContextType>({
  caregiver: null,
  currentUser: null,
  setCurrentUser: () => {},
  currentProfile: null,
  setCurrentProfile: () => {},
  switchProfile: () => {},
  currentSession: null,
  setCurrentSession: () => {},
  isOnline: true,
  currentDifficulty: defaultDifficulty,
  setGameDifficulty: () => {},
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [caregiver, setCaregiver] = useState<Caregiver | null>(() => {
    const saved = localStorage.getItem('mindmitra_caregiver');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mindmitra_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [currentDifficulty, setCurrentDifficulty] = useState<Record<GameType, number>>(defaultDifficulty);

  // Sync profile & language/voice preferences
  const switchProfile = (profile: User | null) => {
    // 1. Clear previous profile session context
    setCurrentSession(null);
    setCurrentDifficulty(defaultDifficulty);

    // 2. Set new profile
    setCurrentUser(profile);
    if (profile) {
      localStorage.setItem('mindmitra_current_user', JSON.stringify(profile));
      if (profile.preferred_language) {
        localStorage.setItem('mindmitra_lang', profile.preferred_language);
      }
    } else {
      localStorage.removeItem('mindmitra_current_user');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.login({ email, password });
      if (res && res.token) {
        localStorage.setItem('mindmitra_token', res.token);
        localStorage.setItem('mindmitra_caregiver', JSON.stringify(res.caregiver));
        setCaregiver(res.caregiver);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.register({ name, email, password });
      if (res && res.token) {
        localStorage.setItem('mindmitra_token', res.token);
        localStorage.setItem('mindmitra_caregiver', JSON.stringify(res.caregiver));
        setCaregiver(res.caregiver);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('mindmitra_token');
    localStorage.removeItem('mindmitra_caregiver');
    localStorage.removeItem('mindmitra_current_user');
    setCaregiver(null);
    setCurrentUser(null);
    setCurrentSession(null);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setGameDifficulty = (gameType: GameType, difficulty: number) => {
    setCurrentDifficulty(prev => ({ ...prev, [gameType]: difficulty }));
  };

  return (
    <AppContext.Provider value={{
      caregiver,
      currentUser,
      setCurrentUser: switchProfile,
      currentProfile: currentUser,
      setCurrentProfile: switchProfile,
      switchProfile,
      currentSession,
      setCurrentSession,
      isOnline,
      currentDifficulty,
      setGameDifficulty,
      login,
      register,
      logout,
    }}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
export const useApp = useAppContext;
