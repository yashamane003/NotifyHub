import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Page Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">Console</span>
            <span className="text-slate-700">/</span>
            <span className="text-sm text-brand-400 font-semibold uppercase tracking-wider">NotifyHub</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500 font-mono">
              SYSTEM TIME: <span className="text-slate-400 font-bold">2026-05-22</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Render */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
