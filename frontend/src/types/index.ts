export interface User {
  id: string;
  email: string;
  displayName: string;
  isVerified: boolean;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'botanical';
  dailyCap: number;
  taskCap: number;
  workDuration: number;
  breakDuration: number;
  chimeEnabled: boolean;
  algorithm: {
    invertConfidence: boolean; // default: true (flow state, high confidence first)
    weights: {
      confidence: number;
      pomodoros: number;
      dueDate: number;
    };
    customFormula?: string;
  };
  accessibility: AccessibilitySettings;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  font: 'inter' | 'dyslexic' | 'system';
  fontScale: number; // 90 to 150
}

export interface Subtask {
  id: string;
  name: string;
  confidence: number; // 1 to 10
  estPomodoros: number;
  completed: boolean;
  completedAt?: string;
}

export interface Task {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  groupIds: string[]; // multi-group support as per PDF
  parentTaskId?: string;
  subtasks?: Subtask[];
  confidence: number; // 1 to 10
  estPomodoros: number;
  completedPomodoros?: number;
  dueDate?: string; // YYYY-MM-DD
  linkSubtaskDueDates?: boolean;
  keepSiblingsSameDay?: boolean;
  priorityScore?: number;
  completed: boolean;
  completedAt?: string;
}

export interface Group {
  id: string;
  name: string;
  color?: string;
  description?: string;
  taskCount?: number;
  activeCount?: number;
  completedCount?: number;
}
