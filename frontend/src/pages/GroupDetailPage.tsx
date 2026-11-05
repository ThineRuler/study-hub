import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { ArrowLeft, Check, Folder } from 'lucide-react';

export const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { tasks, completedTasks, groups, toggleTask } = useTasks();

  const group = groups.find((g) => g._id === groupId);
  const groupName = group?.name || 'Group';

  const assignedActive = tasks.filter((t) => t.groupId === groupId);
  const assignedCompleted = completedTasks.filter((t) => t.groupId === groupId);
  const totalAssigned = assignedActive.length + assignedCompleted.length;

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
        <div className="flex items-center gap-3">
          {group && (
            <span
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: group.color || '#10B981' }}
            />
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
              {groupName}
            </h1>
            <p className="text-sm text-content-secondary mt-0.5">
              Meaningful projects, one manageable step at a time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-surface-border">
          <span className="text-content-primary">
            {assignedCompleted.length} of {totalAssigned} assigned items completed
          </span>
        </div>
      </div>

      {assignedActive.length === 0 && assignedCompleted.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-surface-border rounded-2xl text-xs text-content-muted">
          No tasks currently assigned to {groupName}. Create or edit a task to assign it to this group.
        </div>
      ) : (
        <div className="space-y-2.5">
          {assignedActive.map((task) => (
            <div
              key={task._id}
              onClick={() => toggleTask(task._id, false)}
              className="p-4 rounded-2xl border border-surface-border bg-white shadow-xs hover:border-sage-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="w-6 h-6 rounded-lg border border-surface-border group-hover:border-sage-500 bg-white flex items-center justify-center transition-colors"
                >
                  <span className="text-[10px] text-content-muted">○</span>
                </button>
                <div>
                  <p className="text-sm font-bold text-content-primary">{task.name}</p>
                  <div className="flex items-center gap-2 text-xs text-content-muted mt-0.5">
                    <span>Importance: {Math.round((task.importance ?? 0.5) * 10)}/10</span>
                    {task.dueDate && <span>· Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-surface-subtle border border-surface-border">
                {task.estPomodoros || 1} ◷
              </span>
            </div>
          ))}

          {assignedCompleted.map((task) => (
            <div
              key={task._id}
              onClick={() => toggleTask(task._id, true)}
              className="p-4 rounded-2xl border border-surface-border bg-surface-subtle/50 opacity-60 shadow-xs cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-sage-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-sm font-bold line-through text-content-muted">{task.name}</p>
                  <span className="text-xs text-content-muted">Completed</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-surface-subtle border border-surface-border">
                {task.estPomodoros || 1} ◷
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
