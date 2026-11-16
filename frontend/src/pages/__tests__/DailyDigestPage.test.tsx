import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DailyDigestPage } from '../DailyDigestPage';
import { TaskItem } from '../../api/taskApi';

const mockTasks: TaskItem[] = [
  {
    _id: 'task-1',
    userId: 'u1',
    name: 'Quiz 1',
    estPomodoros: 4,
    importance: 0.5,
    sortOrder: 0,
    completed: false,
    isWorkspace: false,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  },
  {
    _id: 'task-2',
    userId: 'u1',
    name: 'Test Review',
    estPomodoros: 4,
    importance: 0.5,
    sortOrder: 0,
    completed: false,
    isWorkspace: false,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  },
];

let mockCompletedTasks: TaskItem[] = [];
const mockToggleTask = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      _id: 'u1',
      displayName: 'Alex Smith',
      settings: {
        dailyCap: 8,
        workDuration: 25,
        breakDuration: 5,
        chimeEnabled: true,
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
    toggleTask: mockToggleTask,
  }),
}));

const mockToggleTimer = jest.fn();
jest.mock('../../context/TimerContext', () => ({
  useTimer: () => ({
    mode: 'work',
    secondsLeft: 1500,
    timeFormatted: '25:00',
    isActive: false,
    chimeOn: true,
    selectedTaskId: 'task-1',
    currentTask: mockTasks[0],
    workDuration: 25,
    breakDuration: 5,
    toggleTimer: mockToggleTimer,
    pauseTimer: jest.fn(),
    startTimer: jest.fn(),
    resetTimer: jest.fn(),
    setMode: jest.fn(),
    setChimeOn: jest.fn(),
    setSelectedTaskId: jest.fn(),
  }),
}));

describe('DailyDigestPage', () => {
  beforeEach(() => {
    mockCompletedTasks = [];
    jest.clearAllMocks();
  });

  it('renders initial metrics correctly with 0 completed tasks and 2 planned tasks (8 pomodoros)', () => {
    render(
      <MemoryRouter>
        <DailyDigestPage />
      </MemoryRouter>
    );

    // Header
    expect(screen.getByText(/A little forward, Alex/i)).toBeInTheDocument();

    // Today's task completion: "0 of 2"
    expect(screen.getByText('0 of 2')).toBeInTheDocument();
    expect(screen.getByText(/0 completed · 2 planned today/i)).toBeInTheDocument();

    // Today's pomodoros: "0 / 8"
    expect(screen.getByText('0 / 8')).toBeInTheDocument();
    expect(screen.getByText(/8 sessions planned for today/i)).toBeInTheDocument();

    // Mini Pomodoro widget
    expect(screen.getByText('Ready when you are')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('correctly updates task completion to "1 of 2" and pomodoros to "4 / 8" when 1 task is completed today', () => {
    // Simulate 1 task completed today
    mockCompletedTasks = [
      {
        ...mockTasks[0],
        completed: true,
        completedAt: new Date().toISOString(),
      },
    ];

    render(
      <MemoryRouter>
        <DailyDigestPage />
      </MemoryRouter>
    );

    // Today's task completion: 1 of 2
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByText(/1 completed · 1 planned today/i)).toBeInTheDocument();

    // Today's pomodoros: 4 / 8
    expect(screen.getByText('4 / 8')).toBeInTheDocument();
    expect(screen.getByText(/4 sessions planned for today/i)).toBeInTheDocument();
  });

  it('triggers toggleTimer when Start focus button in Mini Pomodoro widget is clicked', () => {
    render(
      <MemoryRouter>
        <DailyDigestPage />
      </MemoryRouter>
    );

    const startFocusBtn = screen.getByRole('button', { name: /Start focus/i });
    fireEvent.click(startFocusBtn);

    expect(mockToggleTimer).toHaveBeenCalledTimes(1);
  });
});
