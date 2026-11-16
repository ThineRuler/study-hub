import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useTasks } from './TaskContext';
import { TaskItem } from '../api/taskApi';

export type TimerMode = 'work' | 'break';

export interface TimerContextType {
  mode: TimerMode;
  secondsLeft: number;
  isActive: boolean;
  chimeOn: boolean;
  selectedTaskId: string;
  workDuration: number;
  breakDuration: number;
  timeFormatted: string;
  currentTask: TaskItem | null;
  startTimer: () => void;
  pauseTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  setMode: (mode: TimerMode) => void;
  setChimeOn: (enabled: boolean) => void;
  setSelectedTaskId: (id: string) => void;
}

interface StoredTimerState {
  mode?: TimerMode;
  secondsLeft?: number;
  isActive?: boolean;
  chimeOn?: boolean;
  selectedTaskId?: string;
  timestamp?: number;
}

const STORAGE_KEY = 'studyhub_timer_state';

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { tasks } = useTasks();

  const workDuration = user?.settings?.workDuration ?? 25;
  const breakDuration = user?.settings?.breakDuration ?? 5;
  const userChime = user?.settings?.chimeEnabled ?? true;

  const [stored] = useState<StoredTimerState | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore JSON parse error
    }
    return null;
  });

  const [mode, setModeState] = useState<TimerMode>(stored?.mode || 'work');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(stored?.selectedTaskId || '');
  const [chimeOn, setChimeOn] = useState<boolean>(
    typeof stored?.chimeOn === 'boolean' ? stored.chimeOn : userChime
  );

  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (stored && typeof stored.secondsLeft === 'number') {
      if (stored.isActive && stored.timestamp) {
        const elapsed = Math.floor((Date.now() - stored.timestamp) / 1000);
        return Math.max(0, stored.secondsLeft - elapsed);
      }
      return stored.secondsLeft;
    }
    return (stored?.mode === 'break' ? breakDuration : workDuration) * 60;
  });

  const [isActive, setIsActive] = useState<boolean>(() => {
    if (stored && stored.isActive && stored.timestamp && typeof stored.secondsLeft === 'number') {
      const elapsed = Math.floor((Date.now() - stored.timestamp) / 1000);
      return stored.secondsLeft - elapsed > 0;
    }
    return false;
  });

  const isModifiedRef = useRef(Boolean(stored));

  // Sync user's default chime when loaded if not explicitly changed
  useEffect(() => {
    if (user?.settings?.chimeEnabled !== undefined && !stored) {
      setChimeOn(user.settings.chimeEnabled);
    }
  }, [user?.settings?.chimeEnabled, stored]);

  // Sync initial work/break duration if unmodified and not active
  useEffect(() => {
    if (!isModifiedRef.current && !isActive) {
      setSecondsLeft((mode === 'work' ? workDuration : breakDuration) * 60);
    }
  }, [workDuration, breakDuration, mode, isActive]);

  // Persist timer state to localStorage whenever it changes
  useEffect(() => {
    try {
      const stateToSave: StoredTimerState = {
        mode,
        secondsLeft,
        isActive,
        chimeOn,
        selectedTaskId,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // ignore storage errors
    }
  }, [mode, secondsLeft, isActive, chimeOn, selectedTaskId]);

  // Countdown timer interval
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Audio chime completion
  const prevSecondsLeftRef = useRef(secondsLeft);
  useEffect(() => {
    if (prevSecondsLeftRef.current > 0 && secondsLeft === 0) {
      if (chimeOn) {
        try {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = mode === 'work' ? 587.33 : 880;
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
            osc.start();
            osc.stop(audioCtx.currentTime + 1.2);
          }
        } catch {
          // Audio context might not be allowed before user interaction
        }
      }
    }
    prevSecondsLeftRef.current = secondsLeft;
  }, [secondsLeft, chimeOn, mode]);

  const toggleTimer = () => {
    isModifiedRef.current = true;
    if (!isActive && secondsLeft === 0) {
      setSecondsLeft((mode === 'work' ? workDuration : breakDuration) * 60);
      setIsActive(true);
      return;
    }
    setIsActive((prev) => !prev);
  };

  const startTimer = () => {
    isModifiedRef.current = true;
    if (secondsLeft === 0) {
      setSecondsLeft((mode === 'work' ? workDuration : breakDuration) * 60);
    }
    setIsActive(true);
  };

  const pauseTimer = () => {
    isModifiedRef.current = true;
    setIsActive(false);
  };

  const resetTimer = () => {
    isModifiedRef.current = true;
    setIsActive(false);
    setSecondsLeft((mode === 'work' ? workDuration : breakDuration) * 60);
  };

  const setMode = (newMode: TimerMode) => {
    isModifiedRef.current = true;
    setModeState(newMode);
    setIsActive(false);
    setSecondsLeft((newMode === 'work' ? workDuration : breakDuration) * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const actionableTasks = useMemo(() => {
    return tasks.filter(
      (t) => !t.isWorkspace && !tasks.some((other) => other.parentTaskId === t._id)
    );
  }, [tasks]);

  const currentTask = useMemo(() => {
    if (selectedTaskId) {
      const found = tasks.find((t) => t._id === selectedTaskId);
      if (found) return found;
    }
    return actionableTasks[0] || null;
  }, [tasks, selectedTaskId, actionableTasks]);

  return (
    <TimerContext.Provider
      value={{
        mode,
        secondsLeft,
        isActive,
        chimeOn,
        selectedTaskId,
        workDuration,
        breakDuration,
        timeFormatted,
        currentTask,
        startTimer,
        pauseTimer,
        toggleTimer,
        resetTimer,
        setMode,
        setChimeOn,
        setSelectedTaskId,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
