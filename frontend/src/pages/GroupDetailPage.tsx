import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';

export const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const groupName = groupId ? groupId.charAt(0).toUpperCase() + groupId.slice(1) : 'Group';

  const assignedTasks = [
    { name: 'Choose featured projects', pomodoros: 2, confidence: 8, dueDate: 'Nov 3', completed: false },
    { name: 'Write project summaries', pomodoros: 3, confidence: 6, dueDate: 'Nov 3', completed: false },
    { name: 'Polish portfolio layout', pomodoros: 2, confidence: 3, dueDate: 'Nov 3', completed: false },
    { name: 'Publish portfolio', pomodoros: 1, confidence: 1, dueDate: 'Nov 3', completed: false },
    { name: 'Clear client inbox', pomodoros: 2, confidence: 5, dueDate: 'Today', completed: false },
    { name: 'Plan next sprint', pomodoros: 2, confidence: 7, dueDate: 'Nov 5', completed: false },
    { name: 'Archive project files', pomodoros: 1, confidence: 8, dueDate: 'Nov 8', completed: false },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/groups"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-secondary hover:text-content-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all groups
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            {groupName}
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            Meaningful projects, one manageable step at a time.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-surface-border">
          <span className="text-content-primary">3 / 10 assigned items completed</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {assignedTasks.map((task, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-surface-border bg-white shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-content-primary">{task.name}</p>
              <div className="flex items-center gap-2 text-xs text-content-muted mt-0.5">
                <span>Confidence {task.confidence}/10</span>
                <span>·</span>
                <span>Due {task.dueDate}</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-surface-subtle border border-surface-border">
              {task.pomodoros} ◷
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
