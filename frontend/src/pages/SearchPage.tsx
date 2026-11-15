import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, CheckCircle2, Circle, Folder } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { searchApi, SearchResponse, SearchType } from '../api/searchApi';

const FILTERS: { value: SearchType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'groups', label: 'Groups' },
];

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-sage-100 text-sage-900 rounded px-0.5">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const type = (searchParams.get('type') as SearchType) || 'all';
  const { groups } = useTasks();

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) {
      setResults(null);
      setError('');
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    searchApi
      .search(query, { type, signal: controller.signal })
      .then(setResults)
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [query, type]);

  const groupMap = new Map(groups.map((g) => [g._id, g]));

  const setType = (value: SearchType) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('type');
    else next.set('type', value);
    setSearchParams(next);
  };

  const total = results ? results.tasks.length + results.groups.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 mb-1">
          <span>SEARCH</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          {query ? <>Results for “{query}”</> : 'Search your workspace'}
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          Matches any part of a task name, task description or group name.
        </p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setType(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              type === f.value
                ? 'bg-sage-100 text-sage-900 border-sage-300'
                : 'bg-white text-content-secondary border-surface-border hover:bg-surface-subtle'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!query && (
        <div className="p-12 text-center bg-white border border-dashed border-surface-border rounded-3xl space-y-3">
          <Search className="w-10 h-10 text-sage-600 mx-auto" />
          <p className="text-sm text-content-secondary">Type in the search box in the sidebar to get started.</p>
        </div>
      )}

      {query && isLoading && <p className="text-sm text-content-muted">Searching…</p>}

      {query && error && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
      )}

      {query && !isLoading && !error && results && total === 0 && (
        <div className="p-12 text-center bg-white border border-dashed border-surface-border rounded-3xl space-y-2">
          <h3 className="text-base font-bold text-content-primary">No matches</h3>
          <p className="text-xs text-content-secondary">Try a shorter word or part of a word.</p>
        </div>
      )}

      {query && !error && results && results.groups.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-content-muted">
            Groups ({results.groups.length})
          </h2>
          {results.groups.map((g) => (
            <Link
              key={g._id}
              to={`/groups/${g._id}`}
              className="p-4 rounded-2xl border border-surface-border bg-white shadow-xs flex items-center gap-3 hover:border-sage-300 transition-colors"
            >
              <Folder className="w-4 h-4 shrink-0" style={{ color: g.color || '#10B981' }} />
              <span className="text-sm font-bold text-content-primary">
                <Highlight text={g.name} query={query} />
              </span>
            </Link>
          ))}
        </section>
      )}

      {query && !error && results && results.tasks.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-content-muted">
            Tasks ({results.tasks.length})
          </h2>
          {results.tasks.map((t) => {
            const grp = t.groupId ? groupMap.get(t.groupId) : undefined;
            const inner = (
              <div className="flex items-start gap-3">
                {t.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-content-muted shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className={`text-sm font-bold text-content-primary ${t.completed ? 'line-through' : ''}`}>
                    <Highlight text={t.name} query={query} />
                  </p>
                  {t.description && (
                    <p className="text-xs text-content-secondary mt-0.5 truncate">
                      <Highlight text={t.description} query={query} />
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-content-muted mt-1">
                    {grp && (
                      <span className="font-semibold" style={{ color: grp.color }}>
                        {grp.name}
                      </span>
                    )}
                    {t.dueDate && <span>Due {new Date(t.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            );
            return grp ? (
              <Link
                key={t._id}
                to={`/groups/${grp._id}`}
                className="block p-4 rounded-2xl border border-surface-border bg-white shadow-xs hover:border-sage-300 transition-colors"
              >
                {inner}
              </Link>
            ) : (
              <div key={t._id} className="p-4 rounded-2xl border border-surface-border bg-white shadow-xs">
                {inner}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default SearchPage;
