import React from 'react';
import { Users, Code2, Palette, Heart } from 'lucide-react';

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
        <p className="text-xs font-bold uppercase tracking-wider text-sage-700">
          BUILT WITH CARE, CREDITED WITH CARE
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          Good work grows together.
        </h1>
        <p className="text-base text-content-secondary leading-relaxed">
          This is where we'll acknowledge the tools, assets, and people behind StudyHub.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Libraries & Frameworks */}
        <div className="p-6 rounded-2xl border border-surface-border bg-white shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
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
          </ul>
        </div>

        {/* Visual Assets */}
        <div className="p-6 rounded-2xl border border-surface-border bg-white shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
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
          <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
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

      {/* Note of Thanks */}
      <div className="p-8 rounded-3xl bg-sage-50/70 border border-sage-200 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center mx-auto">
          <Heart className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-content-primary">A note of thanks</h3>
        <p className="text-sm text-content-secondary max-w-2xl mx-auto leading-relaxed">
          To everyone who has ever needed a gentler way to begin: you're the reason for this workspace. We're building toward a product that respects both your ambitions and your capacity.
        </p>
      </div>
    </div>
  );
};
