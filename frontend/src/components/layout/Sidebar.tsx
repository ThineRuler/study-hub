import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { CreateTaskMenu } from '../tasks/CreateTaskMenu';
import { AccessibilityModal } from '../common/AccessibilityModal';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import {
  SunMedium,
  CalendarDays,
  Timer,
  Calendar,
  CheckCircle2,
  Plus,
  Settings,
  LogOut,
  Sliders,
  Search,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { tasks, completedTasks, groups, createGroup } = useTasks();

  const [isA11yOpen, setIsA11yOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#10B981');
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (location.pathname === '/search') {
      setSearchText(new URLSearchParams(location.search).get('q') || '');
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (location.pathname !== '/search') return;
    const q = searchText.trim();
    const current = new URLSearchParams(location.search).get('q') || '';
    if (!q || q === current) return;
    const timer = setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(q)}`, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchText.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onCloseMobile?.();
  };

  const navItems = [
    { path: '/dashboard', label: 'Daily Digest', icon: SunMedium, badge: tasks.length || undefined },
    { path: '/next-7-days', label: 'Next 7 Days', icon: CalendarDays },
    { path: '/timer', label: 'Pomodoro Timer', icon: Timer },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/completed', label: 'Completed', icon: CheckCircle2, badge: completedTasks.length || undefined },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setIsSubmittingGroup(true);
    try {
      await createGroup(newGroupName.trim(), newGroupColor);
      setNewGroupName('');
      setIsCreateGroupOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create group');
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  return (
    <>
      <aside className="w-64 h-screen flex flex-col justify-between border-r border-surface-border bg-surface-card p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Workspace Title */}
          <div className="px-2 pt-2">
            <p className="text-[10px] font-extrabold tracking-widest uppercase text-sage-700">
              {user?.displayName ? `${user.displayName.toUpperCase()}'S` : 'PERSONAL'}
            </p>
            <h2 className="text-sm font-bold text-content-primary tracking-tight">
              WORKSPACE
            </h2>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="px-1" role="search">
            <Input
              type="search"
              aria-label="Search tasks and groups"
              placeholder="Search tasks & groups"
              value={searchText}
              maxLength={100}
              onChange={(e) => setSearchText(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </form>

          {/* Create Task Button with Sub-menu */}
          <div className="px-1">
            <CreateTaskMenu />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors
                    ${
                      active
                        ? 'bg-sage-100 text-sage-900 font-semibold'
                        : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-sage-700' : 'text-content-muted'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sage-200 text-sage-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Groups Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-content-muted">
                GROUPS
              </span>
              <Link
                to="/groups"
                className="text-xs font-semibold text-sage-700 hover:text-sage-800"
              >
                View all
              </Link>
            </div>

            <div className="space-y-1">
              {groups.map((grp) => (
                <Link
                  key={grp._id}
                  to={`/groups/${grp._id}`}
                  onClick={onCloseMobile}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-content-secondary hover:text-content-primary hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: grp.color || '#10B981' }}
                    />
                    <span className="truncate max-w-[120px]">{grp.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-content-muted">{grp.taskCount || 0}</span>
                </Link>
              ))}

              <button
                type="button"
                onClick={() => setIsCreateGroupOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-sage-700 hover:text-sage-800 hover:bg-sage-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Group</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="pt-4 border-t border-surface-border space-y-1">
          <button
            type="button"
            onClick={() => setIsA11yOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-content-secondary hover:text-content-primary hover:bg-surface-subtle transition-colors"
          >
            <Sliders className="w-4 h-4 text-sage-600" />
            <span>Accessibility Settings</span>
          </button>

          <Link
            to="/settings"
            onClick={onCloseMobile}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors
              ${
                isActive('/settings')
                  ? 'bg-sage-100 text-sage-900 font-semibold'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle'
              }
            `}
          >
            <Settings className="w-4 h-4" />
            <span>Settings & Preferences</span>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Accessibility Modal */}
      <AccessibilityModal isOpen={isA11yOpen} onClose={() => setIsA11yOpen(false)} />

      {/* Create Group Modal */}
      <Modal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        title="Create New Group"
        subtitle="Add a category to organize your projects and daily work."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <Input
            label="Group Name"
            required
            autoFocus
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-2">
              Color Tag
            </label>
            <div className="flex gap-2">
              {['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewGroupColor(color)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    newGroupColor === color ? 'scale-110 border-content-primary' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateGroupOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmittingGroup}>
              Create Group
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
