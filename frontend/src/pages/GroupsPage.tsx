import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, Plus, ArrowRight, Layers, Tag } from 'lucide-react';

export const GroupsPage: React.FC = () => {
  const groups = [
    {
      id: 'work',
      name: 'Work',
      description: 'Client work, thoughtful projects and the next chapter.',
      activeCount: 7,
      completedCount: 3,
      color: 'bg-emerald-500',
    },
    {
      id: 'personal',
      name: 'Personal',
      description: 'Home, everyday care and things that are just for you.',
      activeCount: 7,
      completedCount: 2,
      color: 'bg-amber-500',
    },
    {
      id: 'learning',
      name: 'Learning',
      description: 'Make a little space for curiosity.',
      activeCount: 2,
      completedCount: 1,
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-sage-700 mb-1">
          <span>A LITTLE ORGANIZATION</span>
          <span>·</span>
          <span>THE DIFFERENT PARTS OF YOUR DAY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
          Group tasks in ways that make sense.
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          A task can belong in more than one place without duplicate time accounting.
        </p>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.map((grp) => (
          <Link
            key={grp.id}
            to={`/groups/${grp.id}`}
            className="p-6 rounded-3xl border border-surface-border bg-white shadow-xs hover:border-sage-400 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`w-3.5 h-3.5 rounded-full ${grp.color}`} />
                <span className="text-xs font-bold text-sage-800 bg-sage-50 px-2.5 py-1 rounded-full">
                  {grp.activeCount} active tasks
                </span>
              </div>
              <h3 className="text-xl font-bold text-content-primary group-hover:text-sage-700 transition-colors">
                {grp.name}
              </h3>
              <p className="text-xs text-content-secondary leading-relaxed">
                {grp.description}
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-surface-border flex items-center justify-between text-xs text-content-muted">
              <span>{grp.completedCount} finished</span>
              <span className="flex items-center font-semibold text-sage-700 group-hover:translate-x-1 transition-transform">
                Open group <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Multi-Group Feature Showcase Box */}
      <div className="p-6 rounded-3xl bg-sage-50/80 border border-sage-200 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-sage-700" />
          <h4 className="text-sm font-bold text-sage-900">
            One task, more than one context
          </h4>
        </div>
        <p className="text-xs text-sage-800 leading-relaxed max-w-2xl">
          <strong>Launch portfolio</strong> belongs to Work and Personal. Its four subtasks inherit both tags, so you can find the same work in either group without duplicating it or cluttering your schedule.
        </p>
      </div>
    </div>
  );
};
