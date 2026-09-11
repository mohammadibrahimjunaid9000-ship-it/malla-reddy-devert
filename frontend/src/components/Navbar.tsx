"use client";

import React from "react";
import { BrainCircuit, Sparkles, ShieldCheck } from "lucide-react";

interface NavbarProps {
  onQuickDemo: () => void;
  backendHealthy: boolean | null;
  loading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onQuickDemo,
  backendHealthy,
  loading,
}) => {
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
              AI-Powered Skill Gap Analyzer & Career Pathway Builder
            </p>
          </div>
        </div>

        {/* Action Controls & Health Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Backend Health Badge */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              backendHealthy === true
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : backendHealthy === false
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                backendHealthy === true
                  ? "bg-emerald-400 animate-pulse"
                  : backendHealthy === false
                  ? "bg-rose-400"
                  : "bg-amber-400 animate-ping"
              }`}
            />
            {backendHealthy === true
              ? "FastAPI & Supabase Connected"
              : backendHealthy === false
              ? "Backend Disconnected"
              : "Connecting..."}
          </div>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-all flex items-center justify-center"
            title="View Monorepo on GitHub"
          >
            <svg
              className="h-4 w-4 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>

          {/* Prominent Quick Demo Mode Button */}
          <button
            onClick={onQuickDemo}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 transition-all duration-200 shadow-md shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>⚡ Quick Demo Mode</span>
          </button>
        </div>
      </div>
    </header>
  );
};
