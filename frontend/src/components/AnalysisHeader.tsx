"use client";

import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Award,
  Sparkles,
  TrendingUp,
  Copy,
  Check,
} from "lucide-react";
import { FullAnalysisResponse } from "@/lib/types";

interface AnalysisHeaderProps {
  analysis: FullAnalysisResponse;
  onPracticeInterview?: () => void;
  onShareRoadmap?: () => void;
  sharing?: boolean;
  shareCopied?: boolean;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  analysis,
  onPracticeInterview,
  onShareRoadmap,
  sharing,
  shareCopied,
}) => {
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);

  const score = analysis.match_score;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 80
      ? "text-emerald-400 stroke-emerald-500"
      : score >= 60
      ? "text-amber-400 stroke-amber-500"
      : "text-rose-400 stroke-rose-500";

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col gap-6">
      {/* Top Banner: Candidate Info & Radial Match Score */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="flex flex-col sm:items-start text-center sm:text-left gap-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {analysis.candidate_name}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              {analysis.candidate_level} Readiness
            </span>
            {analysis.persisted && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Verified & Saved to Supabase
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Target Role Evaluation:{" "}
            <strong className="text-slate-100 font-semibold">{analysis.target_role}</strong>
          </p>

          {/* Action CTAs: Practice Mock Interview & Share Roadmap */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {onPracticeInterview && (
              <button
                onClick={onPracticeInterview}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>🎯 Practice Mock Interview</span>
              </button>
            )}

            {onShareRoadmap && (
              <button
                onClick={onShareRoadmap}
                disabled={sharing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
              >
                {shareCopied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Public Link Copied!</span>
                  </>
                ) : sharing ? (
                  <>
                    <span className="animate-spin text-indigo-400">⏳</span>
                    <span>Saving to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-indigo-400" />
                    <span>🔗 Share Roadmap</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Circular SVG Match Ring */}
        <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800/80 px-5 py-3 rounded-2xl shadow-inner">
          <div className="relative h-20 w-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-800/90"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`${scoreColor} transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-extrabold ${scoreColor.split(" ")[0]}`}>
                {score}%
              </span>
            </div>
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Match Score
            </span>
            <span className="text-[11px] text-slate-500">Industry Hiring Fit</span>
          </div>
        </div>
      </div>

      {/* Symmetrical Two-Column Diagnostics: Matched vs Critical Missing Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Matched Skills (Emerald) */}
        <div className="p-5 rounded-xl bg-slate-950/60 border border-emerald-500/20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Verified Skills ({analysis.matched_skills.length})
            </span>
            <span className="text-[10px] text-emerald-500 font-medium font-mono">CONFIRMED</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {analysis.matched_skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Column 2: Critical Missing Skills (Rose) */}
        <div className="p-5 rounded-xl bg-slate-950/60 border border-rose-500/20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Critical Skill Gaps ({analysis.missing_skills.length})
            </span>
            <span className="text-[10px] text-rose-500 font-medium font-mono">PRIORITY</span>
          </div>
          <div className="flex flex-col gap-2 pt-1">
            {analysis.missing_skills.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-900/80 border border-rose-500/20 flex flex-col gap-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-200">{item.skill}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.importance === "High"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {item.importance}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric-Driven Resume Fixes (XYZ Framework) */}
      {analysis.resume_bullet_fixes && analysis.resume_bullet_fixes.length > 0 && (
        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              AI Resume Bullet Polishers (XYZ Action Format)
            </span>
            <span className="text-[11px] text-slate-500">Click to copy</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {analysis.resume_bullet_fixes.map((bullet, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start justify-between gap-3 text-xs text-slate-200 group hover:border-indigo-500/40 transition-all"
              >
                <p className="leading-relaxed text-slate-300">{bullet}</p>
                <button
                  type="button"
                  onClick={() => handleCopy(bullet, idx)}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white shrink-0 transition-all cursor-pointer"
                  title="Copy bullet to clipboard"
                >
                  {copiedIdx === idx ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
