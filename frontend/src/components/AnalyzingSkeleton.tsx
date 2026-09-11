"use client";

import React from "react";
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";

export const AnalyzingSkeleton: React.FC = () => {
  return (
    <div className="w-full rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center min-h-[380px] animate-pulse">
      {/* Animated pulsing icon */}
      <div className="relative mb-6">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
          <BrainCircuit className="h-8 w-8 text-white animate-bounce" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center">
          <Loader2 className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        <h3 className="text-lg font-bold text-white tracking-wide">
          Synthesizing Skill Gap Diagnostics
        </h3>
      </div>
      <p className="text-xs text-slate-400 text-center max-w-md mb-8">
        Gemini AI is currently parsing tech stacks, comparing years of experience against hiring benchmarks, and constructing your custom learning pathway...
      </p>

      {/* Symmetrical Skeleton Cards */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/60 flex flex-col gap-2">
          <div className="h-4 w-32 bg-slate-800 rounded mb-2" />
          <div className="h-3 w-full bg-slate-800/60 rounded" />
          <div className="h-3 w-3/4 bg-slate-800/60 rounded" />
        </div>
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/60 flex flex-col gap-2">
          <div className="h-4 w-32 bg-slate-800 rounded mb-2" />
          <div className="h-3 w-full bg-slate-800/60 rounded" />
          <div className="h-3 w-3/4 bg-slate-800/60 rounded" />
        </div>
      </div>
    </div>
  );
};
