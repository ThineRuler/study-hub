import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { TimerProvider, useTimer } from '../TimerContext';

// Mock Web Audio API
class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      connect: jest.fn(),
      frequency: { value: 0 },
      start: jest.fn(),
      stop: jest.fn(),
    };
  }
  createGain() {
    return {
      connect: jest.fn(),
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
    };
  }
}
(window as any).AudioContext = MockAudioContext;

jest.mock('../AuthContext', () => ({
  useAuth: () => ({
    user: {
      _id: 'u1',
      email: 'test@example.com',
      settings: {
        workDuration: 25,
        breakDuration: 5,
        chimeEnabled: true,
        dailyCap: 8,
      },
    },
    isAuthenticated: true,
  }),
}));

jest.mock('../TaskContext', () => ({
  useTasks: () => ({
    tasks: [],
    completedTasks: [],
    groups: [],
  }),
}));

describe('TimerContext', () => {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TimerProvider>{children}</TimerProvider>
  );

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with default workDuration (25 min = 1500s) and not active', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    expect(result.current.mode).toBe('work');
    expect(result.current.secondsLeft).toBe(25 * 60);
    expect(result.current.isActive).toBe(false);
    expect(result.current.timeFormatted).toBe('25:00');
  });

  it('starts countdown when toggled and decrements seconds', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    act(() => {
      result.current.toggleTimer();
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.secondsLeft).toBe(25 * 60 - 3);
    expect(result.current.timeFormatted).toBe('24:57');
  });

  it('pauses timer WITHOUT resetting remaining time (fixes pause reset bug)', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    // Start
    act(() => {
      result.current.toggleTimer();
    });

    // Advance 10s
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.secondsLeft).toBe(1500 - 10);

    // Pause
    act(() => {
      result.current.pauseTimer();
    });

    expect(result.current.isActive).toBe(false);
    // Crucial check: secondsLeft must be saved, NOT reset back to 1500!
    expect(result.current.secondsLeft).toBe(1490);
    expect(result.current.timeFormatted).toBe('24:50');

    // Advance time while paused: should not change
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.secondsLeft).toBe(1490);

    // Resume: should resume from 1490
    act(() => {
      result.current.toggleTimer();
    });
    expect(result.current.isActive).toBe(true);

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.secondsLeft).toBe(1485);
  });

  it('resets timer back to full duration on resetTimer()', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    act(() => {
      result.current.startTimer();
    });
    act(() => {
      jest.advanceTimersByTime(30000); // 30s in
    });

    expect(result.current.secondsLeft).toBe(1470);

    act(() => {
      result.current.resetTimer();
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.secondsLeft).toBe(1500);
    expect(result.current.timeFormatted).toBe('25:00');
  });

  it('switches between work and break modes and sets correct duration', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    act(() => {
      result.current.setMode('break');
    });

    expect(result.current.mode).toBe('break');
    expect(result.current.secondsLeft).toBe(5 * 60);
    expect(result.current.timeFormatted).toBe('05:00');

    act(() => {
      result.current.setMode('work');
    });

    expect(result.current.mode).toBe('work');
    expect(result.current.secondsLeft).toBe(25 * 60);
    expect(result.current.timeFormatted).toBe('25:00');
  });

  it('persists timer state to localStorage so refresh preserves elapsed time', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    act(() => {
      result.current.startTimer();
    });
    act(() => {
      jest.advanceTimersByTime(12000); // 12 seconds
    });
    act(() => {
      result.current.pauseTimer();
    });

    const savedState = JSON.parse(localStorage.getItem('studyhub_timer_state') || '{}');
    expect(savedState.secondsLeft).toBe(1500 - 12);
    expect(savedState.isActive).toBe(false);
    expect(savedState.mode).toBe('work');
  });
});
