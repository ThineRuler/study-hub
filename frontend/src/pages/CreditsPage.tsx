import React from 'react';
import { Users, Code2, Palette } from 'lucide-react';

export const CreditsPage: React.FC = () => {
  const contributors = [
    { name: 'Ian Hunter', role: 'Project Manager / Frontend' },
    { name: 'Nathalie Benoit', role: 'Database' },
    { name: 'Destiny Louis', role: 'Database' },
    { name: 'Acsah Lukose', role: 'API' },
    { name: 'Rafael Venezuela', role: 'API' },
    { name: 'Steffano Poggioli', role: 'Mobile App' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-sage-700 dark:text-sage-300">
          WHO WORKED ON STUDYHUB
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          Good work grows together.
        </h1>
        <p className="text-base sm:text-lg text-content-secondary leading-relaxed">
          StudyHub was built by students with the intention to help others with piling assignments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Libraries & Frameworks */}
        <div className="p-6 rounded-2xl border border-surface-border bg-white shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-200 flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-content-primary">Libraries & frameworks</h3>
            <p className="text-xs text-content-muted mt-0.5">Application libraries & licenses</p>
          </div>
          <ul className="space-y-2 text-sm text-content-secondary font-medium">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-500" /> MongoDB
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-500" /> Express
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-500" /> React (TypeScript)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-500" /> Node.js
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-500" /> Tailwind CSS
            </li>
          </ul>
        </div>

        {/* Visual Assets */}
        <div className="p-6 rounded-2xl border border-surface-border bg-white shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-200 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-content-primary">Visual assets</h3>
            <p className="text-xs text-content-muted mt-0.5">Design & typography system</p>
          </div>
          <p className="text-sm text-content-secondary leading-relaxed">
            All user experience and design choices were crafted in Figma, utilizing calm botanical tones and accessible typography.
          </p>
        </div>

        {/* Creators & Contributors */}
        <div className="p-6 rounded-2xl border border-surface-border bg-white shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-200 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-content-primary">Creators & contributors</h3>
            <p className="text-xs text-content-muted mt-0.5">Design, engineering, and research partners</p>
          </div>
          <ul className="space-y-2.5 text-xs">
            {contributors.map((c) => (
              <li key={c.name} className="flex justify-between items-center py-0.5 border-b border-surface-subtle last:border-0">
                <span className="font-semibold text-content-primary">{c.name}</span>
                <span className="text-content-muted">{c.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
