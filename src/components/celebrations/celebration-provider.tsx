'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type CelebrationType = 
  | 'success' 
  | 'achievement' 
  | 'milestone' 
  | 'confetti' 
  | 'sparkles' 
  | 'fireworks'
  | 'gentle-pop';

export interface CelebrationConfig {
  type: CelebrationType;
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
  position?: 'center' | 'cursor' | 'element';
  element?: HTMLElement | null;
  message?: string;
  icon?: string;
  color?: string;
}

interface CelebrationContextType {
  triggerCelebration: (config: CelebrationConfig) => void;
  activeCelebrations: Array<CelebrationConfig & { id: string }>;
  clearCelebrations: () => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
}

interface CelebrationProviderProps {
  children: React.ReactNode;
}

export function CelebrationProvider({ children }: CelebrationProviderProps) {
  const [activeCelebrations, setActiveCelebrations] = useState<Array<CelebrationConfig & { id: string }>>([]);

  const triggerCelebration = useCallback((config: CelebrationConfig) => {
    const id = Math.random().toString(36).substr(2, 9);
    const celebration = { ...config, id };
    
    setActiveCelebrations(prev => [...prev, celebration]);

    // Auto-remove after duration
    const duration = config.duration || 3000;
    setTimeout(() => {
      setActiveCelebrations(prev => prev.filter(c => c.id !== id));
    }, duration);
  }, []);

  const clearCelebrations = useCallback(() => {
    setActiveCelebrations([]);
  }, []);

  return (
    <CelebrationContext.Provider value={{ triggerCelebration, activeCelebrations, clearCelebrations }}>
      {children}
    </CelebrationContext.Provider>
  );
}