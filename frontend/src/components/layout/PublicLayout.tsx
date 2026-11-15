import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { FloatingAccessibilityButton } from '../common/FloatingAccessibilityButton';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-content-primary relative">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-surface-border py-6 bg-white/50 text-center text-xs text-content-muted">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center">
          <span>StudyHub · Made with love by UCF students &lt;3</span>
        </div>
      </footer>

      {/* Fixed accessibility button on bottom right */}
      <FloatingAccessibilityButton />
    </div>
  );
};
