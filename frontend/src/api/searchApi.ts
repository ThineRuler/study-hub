export interface TaskSearchResult {
  _id: string;
  name: string;
  description?: string;
  groupId?: string | null;
  parentTaskId?: string | null;
  dueDate?: string | null;
  completed: boolean;
  priorityScore?: number;
}

export interface GroupSearchResult {
  _id: string;
  name: string;
  color?: string;
  sortOrder?: number;
}

export interface SearchResponse {
  query: string;
  tasks: TaskSearchResult[];
  groups: GroupSearchResult[];
}

export type SearchType = 'all' | 'tasks' | 'groups';

export const searchApi = {
  async search(
    q: string,
    options: { type?: SearchType; completed?: boolean; limit?: number; signal?: AbortSignal } = {}
  ): Promise<SearchResponse> {
    const params = new URLSearchParams({ q });
    if (options.type) params.set('type', options.type);
    if (options.completed !== undefined) params.set('completed', String(options.completed));
    if (options.limit !== undefined) params.set('limit', String(options.limit));

    const token = localStorage.getItem('studyhub_jwt_token');
    const res = await fetch(`/api/search?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: options.signal,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.error || `Search failed with status ${res.status}`);
    }
    return json as SearchResponse;
  },
};
