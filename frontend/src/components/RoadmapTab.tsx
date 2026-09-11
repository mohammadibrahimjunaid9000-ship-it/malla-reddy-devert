"use client";

import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  PlaySquare,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { RoadmapItemDetail } from "@/lib/types";

interface RoadmapTabProps {
  roadmap: RoadmapItemDetail[];
  targetRole: string;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({ roadmap, targetRole }) => {
  const [completedWeeks, setCompletedWeeks] = useState<Record<number, boolean>>({});

  const toggleWeek = (week: number) => {
    setCompletedWeeks((prev) => ({
      ...prev,
      [week]: !prev[week],
    }));
  };

  const completedCount = Object.values(completedWeeks).filter(Boolean).length;
  const progressPercent =
    roadmap.length > 0 ? Math.round((completedCount / roadmap.length) * 100) : 0;

  return (
    <div className="w-full rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col gap-6">
      {/* Header & Progress Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-violet-400" />
            4-Week Career Pathway & Skill Mastery
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Curated week-by-week pathway engineered for{" "}
            <strong className="text-slate-200">{targetRole}</strong>.
          </p>
        </div>

        {/* Milestone Tracker Pill */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-200 block">
              {completedCount} of {roadmap.length} Milestones
            </span>
            <span className="text-[10px] text-violet-400 font-semibold font-mono">
              {progressPercent}% Completed
            </span>
          </div>
          <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chronological Weekly Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roadmap.map((item) => {
          const isDone = !!completedWeeks[item.week];

          return (
            <div
              key={item.week}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                isDone
                  ? "bg-slate-950/40 border-emerald-500/40 opacity-80"
                  : "bg-slate-950/70 border-slate-800/80 hover:border-violet-500/40 shadow-lg"
              }`}
            >
              <div>
                {/* Header row: Week Badge + Checkbox */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      isDone
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-violet-500/10 text-violet-300 border-violet-500/20"
                    }`}
                  >
                    Week {item.week}
                  </span>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-200">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleWeek(item.week)}
                      className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 cursor-pointer"
                    />
                    <span className={isDone ? "text-emerald-400 font-semibold" : ""}>
                      {isDone ? "Completed" : "Mark as done"}
                    </span>
                  </label>
                </div>

                <h4
                  className={`text-base font-bold mb-2 transition-all ${
                    isDone ? "line-through text-slate-400" : "text-white"
                  }`}
                >
                  {item.theme}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.task}</p>
              </div>

              {/* Quick Learning Action Buttons */}
              <div className="pt-4 border-t border-slate-800/70 flex flex-col sm:flex-row gap-2">
                {/* 1-Click YouTube Search Button */}
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    item.youtube_search_query
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 transition-all shadow-sm"
                >
                  <PlaySquare className="h-4 w-4 text-rose-500" />
                  <span>Watch on YouTube</span>
                  <ExternalLink className="h-3 w-3 text-rose-400" />
                </a>

                {/* 1-Click Coursera Exploration */}
                <a
                  href={`https://www.coursera.org/search?query=${encodeURIComponent(
                    item.coursera_search_query
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 transition-all shadow-sm"
                >
                  <GraduationCap className="h-4 w-4 text-cyan-400" />
                  <span>Coursera Courses</span>
                  <ExternalLink className="h-3 w-3 text-cyan-400" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
