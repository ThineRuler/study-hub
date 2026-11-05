export interface TaskPayload {
  name: string;
  description?: string;
  groupId?: string;
  parentTaskId?: string;
  importance?: number;
  estPomodoros?: number;
  dueDate?: string;
  completed?: boolean;
}

export interface TaskItem {
  _id: string;
  userId: string;
  groupId?: string;
  parentTaskId?: string;
  name: string;
  description?: string;
  importance: number;
  estPomodoros: number;
  dueDate?: string;
  priorityScore?: number;
  sortOrder: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  subtasks?: TaskItem[];
}

function getAuthHeaders(token?: string | null): HeadersInit {
  const authToken = token || localStorage.getItem('studyhub_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = json.error || json.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return json as T;
}

export const taskApi = {
  async getTasks(params?: {
    completed?: boolean;
    groupId?: string;
    parentTaskId?: string;
    from?: string;
    to?: string;
  }): Promise<TaskItem[]> {
    const query = new URLSearchParams();
    if (params?.completed !== undefined) query.set('completed', String(params.completed));
    if (params?.groupId) query.set('groupId', params.groupId);
    if (params?.parentTaskId) query.set('parentTaskId', params.parentTaskId);
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`/api/tasks${qs}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<TaskItem[]>(res);
  },

  async getTask(id: string): Promise<TaskItem> {
    const res = await fetch(`/api/tasks/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<TaskItem>(res);
  },

  async createTask(payload: TaskPayload): Promise<TaskItem> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<TaskItem>(res);
  },

  async updateTask(id: string, payload: Partial<TaskPayload>): Promise<TaskItem> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<TaskItem>(res);
  },

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete task ${id}`);
    }
  },
};
