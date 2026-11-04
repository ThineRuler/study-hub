import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CreateTaskMenu } from '../tasks/CreateTaskMenu';
import { AccessibilityModal } from '../common/AccessibilityModal';
import {
  SunMedium,
  CalendarDays,
  Timer,
  Calendar,
  CheckCircle2,
  Folder,
  Plus,
  Settings,
  LogOut,
  Sliders,
  User as UserIcon,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isA11yOpen, setIsA11yOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Daily Digest', icon: SunMedium, badge: 3 },
    { path: '/next-7-days', label: 'Next 7 Days', icon: CalendarDays },
    { path: '/timer', label: 'Pomodoro Timer', icon: Timer },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/completed', label: 'Completed', icon: CheckCircle2 },
  ];

  const groups = [
    { id: 'work', name: 'Work', count: 7, color: 'bg-emerald-500' },
    { id: 'personal', name: 'Personal', count: 7, color: 'bg-amber-500' },
    { id: 'learning', name: 'Learning', count: 2, color: 'bg-blue-500' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <aside className="w-64 h-screen flex flex-col justify-between border-r border-surface-border bg-surface-card p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Workspace Title */}
          <div className="px-2 pt-2">
            <p className="text-[10px] font-extrabold tracking-widest uppercase text-sage-700">
              {user?.displayName ? `${user.displayName.toUpperCase()}'S` : "ALEX'S"}
            </p>
            <h2 className="text-sm font-bold text-content-primary tracking-tight">
              PERSONAL WORKSPACE
            </h2>
          </div>

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
                  {item.badge !== undefined && (
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
                  key={grp.id}
                  to={`/groups/${grp.id}`}
                  onClick={onCloseMobile}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-content-secondary hover:text-content-primary hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${grp.color}`} />
                    <span>{grp.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-content-muted">{grp.count}</span>
                </Link>
              ))}

              <Link
                to="/groups"
                onClick={onCloseMobile}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-sage-700 hover:text-sage-800 hover:bg-sage-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Group</span>
              </Link>
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

      <AccessibilityModal isOpen={isA11yOpen} onClose={() => setIsA11yOpen(false)} />
    </>
  );
};
