import {
  parseCalendarDate,
  getLocalDateString,
  isCompletedToday,
  formatDueDate,
  computeClientSchedule,
} from '../scheduler';
import { TaskItem } from '../../api/taskApi';

describe('scheduler utility tests', () => {
  describe('parseCalendarDate', () => {
    it('correctly parses plain YYYY-MM-DD date strings without timezone shifts', () => {
      const parsed = parseCalendarDate('2026-11-15');
      expect(parsed).toEqual({
        year: 2026,
        month: 11,
        day: 15,
        dateStr: '2026-11-15',
      });
    });

    it('correctly parses MongoDB UTC-midnight ISO strings preserving the intended calendar day', () => {
      const parsed = parseCalendarDate('2026-11-15T00:00:00.000Z');
      expect(parsed).toEqual({
        year: 2026,
        month: 11,
        day: 15,
        dateStr: '2026-11-15',
      });
    });

    it('handles Date objects', () => {
      const date = new Date(2026, 10, 15); // Nov 15, 2026 local
      const parsed = parseCalendarDate(date);
      expect(parsed?.year).toBe(2026);
      expect(parsed?.month).toBe(11);
      expect(parsed?.day).toBe(15);
      expect(parsed?.dateStr).toBe('2026-11-15');
    });

    it('returns null for undefined, empty string, or invalid input', () => {
      expect(parseCalendarDate(undefined)).toBeNull();
      expect(parseCalendarDate('')).toBeNull();
      expect(parseCalendarDate('invalid-date')).toBeNull();
    });
  });

  describe('formatDueDate', () => {
    it('formats YYYY-MM-DD to M/D/YYYY', () => {
      expect(formatDueDate('2026-11-15')).toBe('11/15/2026');
    });

    it('formats MongoDB UTC-midnight strings to M/D/YYYY without 1-day-behind regression', () => {
      expect(formatDueDate('2026-11-15T00:00:00.000Z')).toBe('11/15/2026');
    });

    it('returns empty string when dueDate is missing', () => {
      expect(formatDueDate(undefined)).toBe('');
    });
  });

  describe('getLocalDateString and isCompletedToday', () => {
    it('formats current date as YYYY-MM-DD in local time', () => {
      const d = new Date(2026, 10, 15);
      expect(getLocalDateString(d)).toBe('2026-11-15');
    });

    it('identifies timestamps that occurred today in local timezone even if UTC is tomorrow', () => {
      // Create a timestamp for 9:45 PM EST on Nov 15 (which is 2:45 AM UTC on Nov 16)
      const now = new Date();
      const localToday = getLocalDateString(now);
      const isoNow = now.toISOString();

      expect(isCompletedToday(isoNow, localToday)).toBe(true);
    });

    it('rejects timestamps that occurred on different days', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const todayStr = getLocalDateString(new Date());

      expect(isCompletedToday(yesterday.toISOString(), todayStr)).toBe(false);
    });

    it('handles null/undefined gracefully', () => {
      expect(isCompletedToday(undefined)).toBe(false);
    });
  });

  describe('computeClientSchedule', () => {
    const baseTask: TaskItem = {
      _id: 't1',
      userId: 'u1',
      name: 'Task 1',
      importance: 0.5,
      sortOrder: 0,
      estPomodoros: 4,
      completed: false,
      isWorkspace: false,
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    };

    it('packs tasks into today (Day 0) up to dailyCap', () => {
      const tasks: TaskItem[] = [
        { ...baseTask, _id: 't1', name: 'Quiz', estPomodoros: 4 },
        { ...baseTask, _id: 't2', name: 'Test', estPomodoros: 4 },
        { ...baseTask, _id: 't3', name: 'Project', estPomodoros: 4 },
      ];

      const result = computeClientSchedule(tasks, { dailyCap: 8 });
      expect(result.todayTasks.map((t) => t._id)).toEqual(['t1', 't2']);
      expect(result.todayPomodoros).toBe(8);
      expect(result.deferredTasks.map((t) => t._id)).toEqual(['t3']);
    });

    it('takes completedTodayPomodoros into account for Day 0 capacity', () => {
      const tasks: TaskItem[] = [
        { ...baseTask, _id: 't2', name: 'Test', estPomodoros: 4 },
        { ...baseTask, _id: 't3', name: 'Project', estPomodoros: 4 },
      ];

      // If 4 pomodoros were already completed today, only 4 remain for Day 0 (dailyCap 8)
      const result = computeClientSchedule(tasks, { dailyCap: 8 }, { completedTodayPomodoros: 4 });
      expect(result.todayTasks.map((t) => t._id)).toEqual(['t2']);
      expect(result.todayPomodoros).toBe(4);
      expect(result.deferredTasks.map((t) => t._id)).toEqual(['t3']);
    });

    it('excludes parent workspace tasks from active queue', () => {
      const tasks: TaskItem[] = [
        { ...baseTask, _id: 'parent1', name: 'Study Workspace', isWorkspace: true, estPomodoros: 8 },
        { ...baseTask, _id: 'sub1', name: 'Quiz', parentTaskId: 'parent1', estPomodoros: 4 },
      ];

      const result = computeClientSchedule(tasks, { dailyCap: 8 });
      // Parent workspace should not appear in todayTasks
      expect(result.todayTasks.map((t) => t._id)).toEqual(['sub1']);
    });
  });
});
