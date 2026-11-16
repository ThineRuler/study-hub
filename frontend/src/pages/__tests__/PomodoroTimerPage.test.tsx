import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PomodoroTimerPage } from '../PomodoroTimerPage';
import { TaskItem } from '../../api/taskApi';

const mockTasks: TaskItem[] = [
  {
    _id: 't-1',
    userId: 'u1',
    name: 'Study Chemistry',
    estPomodoros: 2,
    importance: 0.5,
    sortOrder: 0,
    completed: false,
    isWorkspace: false,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  },
  {
    _id: 't-2',
    userId: 'u1',
    name: 'Read Chapter 4',
    estPomodoros: 1,
    importance: 0.5,
    sortOrder: 0,
    completed: false,
    isWorkspace: false,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  },
];

const mockCompletedTasks: TaskItem[] = [
  {
    _id: 't-3',
    userId: 'u1',
    name: 'Lab Report',
    estPomodoros: 3,
    importance: 0.5,
    sortOrder: 0,
    completed: true,
    completedAt: new Date().toISOString(),
    isWorkspace: false,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  },
];

const mockToggleTimer = jest.fn();
const mockResetTimer = jest.fn();
const mockSetMode = jest.fn();
const mockSetSelectedTaskId = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      _id: 'u1',
      settings: {
        dailyCap: 8,
      },
    },
    isAuthenticated: true,
  }),
}));

jest.mock('../../context/TaskContext', () => ({
  useTasks: () => ({
    tasks: mockTasks,
    completedTasks: mockCompletedTasks,
    groups: [],
  }),
}));

jest.mock('../../context/TimerContext', () => ({
  useTimer: () => ({
    mode: 'work',
    secondsLeft: 1500,
    timeFormatted: '25:00',
    isActive: false,
    chimeOn: true,
    selectedTaskId: 't-1',
    currentTask: mockTasks[0],
    workDuration: 25,
    breakDuration: 5,
    toggleTimer: mockToggleTimer,
    pauseTimer: jest.fn(),
    startTimer: jest.fn(),
    resetTimer: mockResetTimer,
    setMode: mockSetMode,
    setChimeOn: jest.fn(),
    setSelectedTaskId: mockSetSelectedTaskId,
  }),
}));

describe('PomodoroTimerPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders timer clock, active task, and controls', () => {
    render(<PomodoroTimerPage />);

    // Header and clock
    expect(screen.getByText('POMODORO TIMER')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getAllByText('Study Chemistry').length).toBeGreaterThanOrEqual(1);

    // Mode buttons
    expect(screen.getByRole('button', { name: /Work \(25 min\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Break \(5 min\)/i })).toBeInTheDocument();

    // Control buttons
    expect(screen.getByRole('button', { name: /Start focus/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();

    // Today's completed count: 3 completed out of dailyCap 8
    expect(screen.getByText(/Today: 3 \/ 8 counted/i)).toBeInTheDocument();
  });

  it('handles clicking mode buttons, Start focus, and Reset', () => {
    render(<PomodoroTimerPage />);

    // Click Break
    fireEvent.click(screen.getByRole('button', { name: /Break \(5 min\)/i }));
    expect(mockSetMode).toHaveBeenCalledWith('break');

    // Click Start focus
    fireEvent.click(screen.getByRole('button', { name: /Start focus/i }));
    expect(mockToggleTimer).toHaveBeenCalledTimes(1);

    // Click Reset
    fireEvent.click(screen.getByRole('button', { name: /Reset/i }));
    expect(mockResetTimer).toHaveBeenCalledTimes(1);
  });

  it('renders task queue and allows task selection', () => {
    render(<PomodoroTimerPage />);

    expect(screen.getByText("Today's queue")).toBeInTheDocument();
    expect(screen.getByText('Read Chapter 4')).toBeInTheDocument();

    // Click on Read Chapter 4
    fireEvent.click(screen.getByText('Read Chapter 4'));
    expect(mockSetSelectedTaskId).toHaveBeenCalledWith('t-2');
  });
});
