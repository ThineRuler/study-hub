export interface GroupItem {
  _id: string;
  userId: string;
  name: string;
  color?: string;
  sortOrder: number;
  taskCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('studyhub_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export const groupApi = {
  async getGroups(): Promise<GroupItem[]> {
    const res = await fetch('/api/groups', {
      headers: getAuthHeaders(),
    });
    return handleResponse<GroupItem[]>(res);
  },

  async createGroup(name: string, color = '#53755C'): Promise<GroupItem> {
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, color }),
    });
    return handleResponse<GroupItem>(res);
  },

  async updateGroup(id: string, payload: { name?: string; color?: string; sortOrder?: number }): Promise<GroupItem> {
    const res = await fetch(`/api/groups/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<GroupItem>(res);
  },

  async deleteGroup(id: string): Promise<void> {
    const res = await fetch(`/api/groups/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete group ${id}`);
    }
  },
};
