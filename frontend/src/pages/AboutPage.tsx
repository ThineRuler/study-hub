import React from 'react';
import { Layers, Sliders, RefreshCw, HeartHandshake } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-sage-700">
          How StudyHub works
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-content-primary tracking-tight">
          A To-Do list that puts your work style first.
        </h1>
        <p className="text-base sm:text-lg text-content-secondary leading-relaxed">
          Tasks can feel heavy and long before any work begins. StudyHub helps break those tasks into bite-sized tasks that you can manage in just a day.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature 1 */}
        <div className="p-6 rounded-2xl border border-surface-border bg-white shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-content-primary">
            Make the work approachable
          </h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            A simple 6-step process is all that StudyHub needs to turn your task into something much more manageable. Just tell us your confidence, estimated time to complete, and due date. StudyHub uses an algorithm to build your personalized daily schedule.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="p-6 rounded-2xl border border-surface-border bg-white shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-content-primary">
            Customize everything to your needs
          </h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            Almost everything is customizable to make StudyHub personal to how you want it to be, from its looks to its algorithm. Everything is made with you in mind, so make it your own!
          </p>
        </div>

        {/* Feature 3 */}
        <div className="p-6 rounded-2xl border border-surface-border bg-white shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-content-primary">
            Constant updates
          </h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            StudyHub prepares your day with daily updates, redoing the algorithm every day to make sure everything is digestible. StudyHub can also send you notifications to make sure you keep up with your goals.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="p-6 rounded-2xl border border-surface-border bg-white shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-content-primary">
            Things not going as planned? No problem
          </h3>
          <p className="text-sm text-content-secondary leading-relaxed">
            StudyHub takes your missed pomodoros into consideration to make sure you can complete tasks when life happens. Don't worry if you feel like you're falling behind—StudyHub will pick you back up.
          </p>
        </div>
      </div>
    </div>
  );
};
