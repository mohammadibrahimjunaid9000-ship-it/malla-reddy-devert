"use client";

import React from "react";
import { BrainCircuit } from "lucide-react";

interface NavbarProps {
  onQuickDemo?: () => void;
  backendHealthy?: boolean | null;
  loading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = () => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo and Subtitle */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/10">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-300">
                SkillBridge
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v2.0 AI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              AI-Powered Skill Gap Analyzer &amp; Career Pathway Builder
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
