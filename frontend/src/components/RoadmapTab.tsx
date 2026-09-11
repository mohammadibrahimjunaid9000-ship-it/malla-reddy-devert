"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Play,
  PlaySquare,
  GraduationCap,
  Sparkles,
  Video,
  Tv,
  Loader2,
} from "lucide-react";
import { RoadmapItemDetail, YouTubeVideoItem } from "@/lib/types";
import { searchYouTube } from "@/lib/api";

interface RoadmapTabProps {
  roadmap: RoadmapItemDetail[];
  targetRole: string;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({ roadmap, targetRole }) => {
  const [completedWeeks, setCompletedWeeks] = useState<Record<number, boolean>>({});
  const [videosByWeek, setVideosByWeek] = useState<Record<number, YouTubeVideoItem[]>>({});
  const [loadingVideos, setLoadingVideos] = useState<Record<number, boolean>>({});

  const toggleWeek = (week: number) => {
    setCompletedWeeks((prev) => ({
      ...prev,
      [week]: !prev[week],
    }));
  };

  const completedCount = Object.values(completedWeeks).filter(Boolean).length;
  const progressPercent =
    roadmap.length > 0 ? Math.round((completedCount / roadmap.length) * 100) : 0;

  // Fetch YouTube tutorials for each roadmap week
  useEffect(() => {
    roadmap.forEach((item) => {
      // If we already have videos for this week, skip
      if (videosByWeek[item.week] || loadingVideos[item.week]) return;

      setLoadingVideos((prev) => ({ ...prev, [item.week]: true }));
      const searchQuery = item.youtube_search_query || `${item.theme} tutorial`;

      searchYouTube(searchQuery, 1)
        .then((videos) => {
          if (videos && videos.length > 0) {
            setVideosByWeek((prev) => ({ ...prev, [item.week]: videos }));
          }
        })
        .catch(() => {
          // Gracefully continue without breaking UI
        })
        .finally(() => {
          setLoadingVideos((prev) => ({ ...prev, [item.week]: false }));
        });
    });
  }, [roadmap]);

  return (
    <div className="w-full rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col gap-6">
      {/* Header & Symmetrical Progress Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <span>4-Week Career Pathway & Interactive Masterclasses</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Personalized curriculum for <strong className="text-indigo-300 font-semibold">{targetRole}</strong> with live YouTube video recommendations.
          </p>
        </div>

        {/* Milestone Tracker Pill */}
        <div className="flex items-center gap-3.5 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-200 block">
              {completedCount} of {roadmap.length} Milestones
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold font-mono">
              {progressPercent}% Complete
            </span>
          </div>
          <div className="w-20 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Symmetrical Grid of Weekly Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roadmap.map((item) => {
          const isDone = !!completedWeeks[item.week];
          const videos = videosByWeek[item.week] || [];
          const isLoading = loadingVideos[item.week];
          const primaryVideo = videos[0];

          return (
            <div
              key={item.week}
              className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isDone
                  ? "bg-slate-950/40 border-emerald-500/40 shadow-emerald-500/5"
                  : "bg-slate-950/80 border-slate-800 hover:border-indigo-500/40 shadow-xl"
              }`}
            >
              {/* Card Body */}
              <div className="p-6 flex flex-col gap-4">
                {/* Header Row: Week Pill + Completion Checkbox */}
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      isDone
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    Week {item.week}
                  </span>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors select-none">
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

                {/* Theme & Task */}
                <div>
                  <h4
                    className={`text-base font-bold transition-all ${
                      isDone ? "line-through text-slate-400" : "text-white"
                    }`}
                  >
                    {item.theme}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    {item.task}
                  </p>
                </div>

                {/* Embedded YouTube Tutorial Video Player */}
                <div className="mt-1 rounded-xl overflow-hidden border border-slate-800/90 bg-slate-900/90">
                  <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Video className="h-3.5 w-3.5 text-rose-500" />
                      Recommended Video Tutorial
                    </span>
                    {primaryVideo?.channelTitle && (
                      <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                        {primaryVideo.channelTitle}
                      </span>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="aspect-video w-full flex flex-col items-center justify-center gap-2 text-slate-500 bg-slate-950/50">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                      <span className="text-[11px]">Finding top video tutorial...</span>
                    </div>
                  ) : primaryVideo ? (
                    <div className="relative aspect-video w-full bg-black">
                      <iframe
                        src={primaryVideo.embedUrl}
                        title={primaryVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full flex flex-col items-center justify-center gap-2 text-slate-500 bg-slate-950/50 p-4 text-center">
                      <Tv className="h-6 w-6 text-slate-600" />
                      <span className="text-xs font-medium text-slate-400">
                        Masterclass tutorial for {item.theme}
                      </span>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                          item.youtube_search_query
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                      >
                        <span>Search on YouTube</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions: External Links */}
              <div className="px-6 py-3.5 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    item.youtube_search_query
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 text-rose-300 transition-all"
                >
                  <PlaySquare className="h-3.5 w-3.5 text-rose-400" />
                  <span>More on YouTube</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>

                <a
                  href={`https://www.coursera.org/search?query=${encodeURIComponent(
                    item.coursera_search_query
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-500/20 text-indigo-300 transition-all"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Coursera Courses</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
