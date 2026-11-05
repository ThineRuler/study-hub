import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { taskApi, TaskItem, TaskPayload } from '../api/taskApi';
import { groupApi, GroupItem } from '../api/groupApi';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: TaskItem[];
  completedTasks: TaskItem[];
  groups: GroupItem[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  createTask: (payload: TaskPayload) => Promise<TaskItem>;
  toggleTask: (id: string, currentCompleted: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  createGroup: (name: string, color?: string) => Promise<GroupItem>;
  deleteGroup: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setTasks([]);
      setCompletedTasks([]);
      setGroups([]);
      return;
    }

    setIsLoading(true);
    try {
      const [activeList, completedList, groupList] = await Promise.all([
        taskApi.getTasks({ completed: false }),
        taskApi.getTasks({ completed: true }),
        groupApi.getGroups(),
      ]);

      setTasks(activeList);
      setCompletedTasks(completedList);

      // If user has no groups yet, auto-create standard groups
      if (groupList.length === 0) {
        try {
          const g1 = await groupApi.createGroup('Work', '#10B981');
          const g2 = await groupApi.createGroup('Personal', '#F59E0B');
          const g3 = await groupApi.createGroup('Learning', '#3B82F6');
          setGroups([g1, g2, g3]);
        } catch {
          setGroups([]);
        }
      } else {
        setGroups(groupList);
      }
    } catch (err) {
      console.error('Failed to load tasks/groups:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createTask = async (payload: TaskPayload): Promise<TaskItem> => {
    const created = await taskApi.createTask(payload);
    await refreshData();
    return created;
  };

  const toggleTask = async (id: string, currentCompleted: boolean) => {
    // Optimistic UI update
    const nextCompleted = !currentCompleted;
    if (nextCompleted) {
      const found = tasks.find((t) => t._id === id);
      if (found) {
        setTasks((prev) => prev.filter((t) => t._id !== id));
        setCompletedTasks((prev) => [{ ...found, completed: true, completedAt: new Date().toISOString() }, ...prev]);
      }
    } else {
      const found = completedTasks.find((t) => t._id === id);
      if (found) {
        setCompletedTasks((prev) => prev.filter((t) => t._id !== id));
        setTasks((prev) => [...prev, { ...found, completed: false, completedAt: undefined }]);
      }
    }

    try {
      await taskApi.updateTask(id, { completed: nextCompleted });
      await refreshData();
    } catch (err) {
      console.error('Failed to update task state:', err);
      await refreshData();
    }
  };

  const deleteTask = async (id: string) => {
    await taskApi.deleteTask(id);
    await refreshData();
  };

  const createGroup = async (name: string, color?: string): Promise<GroupItem> => {
    const created = await groupApi.createGroup(name, color);
    await refreshData();
    return created;
  };

  const deleteGroup = async (id: string) => {
    await groupApi.deleteGroup(id);
    await refreshData();
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        completedTasks,
        groups,
        isLoading,
        refreshData,
        createTask,
        toggleTask,
        deleteTask,
        createGroup,
        deleteGroup,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
