"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  ListChecks,
  RotateCcw,
  Check,
} from "lucide-react";
import { RoadmapItemDetail, YouTubeVideoItem } from "@/lib/types";
import { searchYouTube } from "@/lib/api";

interface RoadmapTabProps {
  roadmap: RoadmapItemDetail[];
  targetRole: string;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({ roadmap, targetRole }) => {
  // Key for localStorage persistence
  const storageKey = useMemo(() => {
    const cleanRole = (targetRole || "general").toLowerCase().replace(/[^a-z0-9]/g, "_");
    return `skillbridge_roadmap_tasks_${cleanRole}`;
  }, [targetRole]);

  // Granular task completion state: { "week_taskIndex": boolean }
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [videosByWeek, setVideosByWeek] = useState<Record<number, YouTubeVideoItem[]>>({});
  const [activeVideoIdxByWeek, setActiveVideoIdxByWeek] = useState<Record<number, number>>({});
  const [loadingVideos, setLoadingVideos] = useState<Record<number, boolean>>({});

  // Initialize from localStorage on mount or role change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCheckedTasks(JSON.parse(saved));
      } else {
        setCheckedTasks({});
      }
    } catch {
      setCheckedTasks({});
    }
  }, [storageKey]);

  // Persist task checks to localStorage
  const toggleTask = (week: number, taskIdx: number) => {
    setCheckedTasks((prev) => {
      const key = `${week}_${taskIdx}`;
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Ignore localStorage quota errors
      }
      return next;
    });
  };

  const resetAllTasks = () => {
    if (window.confirm("Reset all checked roadmap tasks for this role?")) {
      setCheckedTasks({});
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Ignore
      }
    }
  };

  // Helper to get task list for a week with backward compatibility
  const getTasksForWeek = (item: RoadmapItemDetail): string[] => {
    if (item.tasks && item.tasks.length > 0) {
      return item.tasks;
    }
    if (item.task) {
      // Split by semicolons or periods if it's a long task string
      const parts = item.task.split(/(?<=[.?!])\s+/).filter((p) => p.trim().length > 10);
      return parts.length > 1 ? parts : [item.task];
    }
    return [`Complete weekly milestones for ${item.theme}`];
  };

  // Compute total task stats across all weeks
  const allWeekTasks = useMemo(() => {
    return roadmap.map((item) => ({
      week: item.week,
      tasks: getTasksForWeek(item),
    }));
  }, [roadmap]);

  const totalTasks = useMemo(() => {
    return allWeekTasks.reduce((acc, curr) => acc + curr.tasks.length, 0);
  }, [allWeekTasks]);

  const completedTasks = useMemo(() => {
    return Object.values(checkedTasks).filter(Boolean).length;
  }, [checkedTasks]);

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Fetch 2-3 YouTube tutorials for each roadmap week
  useEffect(() => {
    roadmap.forEach((item) => {
      if (videosByWeek[item.week] || loadingVideos[item.week]) return;

      setLoadingVideos((prev) => ({ ...prev, [item.week]: true }));
      const searchQuery =
        (item.search_queries && item.search_queries[0]) ||
        item.youtube_search_query ||
        `${item.theme} tutorial`;

      searchYouTube(searchQuery, 3)
        .then((videos) => {
          if (videos && videos.length > 0) {
            setVideosByWeek((prev) => ({ ...prev, [item.week]: videos }));
          }
        })
        .catch(() => {
          // Graceful fallback
        })
        .finally(() => {
          setLoadingVideos((prev) => ({ ...prev, [item.week]: false }));
        });
    });
  }, [roadmap]);

  return (
    <div className="w-full rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col gap-6">
      {/* Symmetrical Header with Live Sub-Task Progress Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <span>4-Week Career Pathway & Interactive Masterclasses</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tailored engineering curriculum for{" "}
            <strong className="text-indigo-300 font-semibold">{targetRole}</strong> with multi-video tutorials &amp; sub-task checklists.
          </p>
        </div>

        {/* Global Progress Pill & Reset */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-200 block">
              {completedTasks} of {totalTasks} Tasks Done
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold font-mono">
              {progressPercent}% Complete
            </span>
          </div>
          <div className="w-24 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {completedTasks > 0 && (
            <button
              onClick={resetAllTasks}
              title="Reset checklist"
              className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Symmetrical 2-Column Grid of Weekly Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roadmap.map((item) => {
          const tasks = getTasksForWeek(item);
          const completedInThisWeek = tasks.filter((_, idx) => checkedTasks[`${item.week}_${idx}`]).length;
          const isWeekFullyCompleted = tasks.length > 0 && completedInThisWeek === tasks.length;
          const videos = videosByWeek[item.week] || [];
          const activeIdx = activeVideoIdxByWeek[item.week] || 0;
          const activeVideo = videos[activeIdx] || videos[0];
          const isLoading = loadingVideos[item.week];

          return (
            <div
              key={item.week}
              className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isWeekFullyCompleted
                  ? "bg-slate-950/60 border-emerald-500/50 shadow-lg shadow-emerald-500/5"
                  : "bg-slate-950/80 border-slate-800 hover:border-indigo-500/40 shadow-xl"
              }`}
            >
              {/* Card Main Body */}
              <div className="p-6 flex flex-col gap-4">
                {/* Header: Week Badge, Focus Skills, & Week Status */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                        isWeekFullyCompleted
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      Week {item.week}
                    </span>

                    {isWeekFullyCompleted && (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Week Completed
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-mono font-medium text-slate-400">
                    {completedInThisWeek}/{tasks.length} tasks
                  </span>
                </div>

                {/* Module Theme & Focus Skills */}
                <div>
                  <h4
                    className={`text-base font-bold transition-all ${
                      isWeekFullyCompleted ? "text-emerald-300" : "text-white"
                    }`}
                  >
                    {item.theme}
                  </h4>

                  {item.focus_skills && item.focus_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.focus_skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-950/50 text-indigo-300 border border-indigo-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interactive Multi-Item Sub-Task Checklist */}
                <div className="flex flex-col gap-2 pt-1 pb-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <ListChecks className="h-3.5 w-3.5 text-indigo-400" />
                      Actionable Milestones Checklist
                    </span>
                    <span className="text-[10px] text-slate-500">Auto-saved</span>
                  </div>

                  <div className="flex flex-col gap-2 bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
                    {tasks.map((taskStr, tIdx) => {
                      const isTaskDone = !!checkedTasks[`${item.week}_${tIdx}`];
                      return (
                        <label
                          key={tIdx}
                          className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all duration-150 select-none ${
                            isTaskDone
                              ? "bg-emerald-950/20 text-slate-400 line-through"
                              : "hover:bg-slate-800/50 text-slate-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isTaskDone}
                            onChange={() => toggleTask(item.week, tIdx)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 cursor-pointer"
                          />
                          <span className="text-xs leading-relaxed font-medium">
                            {taskStr}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Multi-Video Masterclass Shelf */}
                <div className="rounded-xl overflow-hidden border border-slate-800/90 bg-slate-900/90 flex flex-col">
                  {/* Video Shelf Header */}
                  <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Video className="h-3.5 w-3.5 text-rose-500" />
                      Recommended Video Tutorials ({videos.length || 1})
                    </span>
                    {activeVideo?.channelTitle && (
                      <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                        {activeVideo.channelTitle}
                      </span>
                    )}
                  </div>

                  {/* Active 16:9 Video Player */}
                  {isLoading ? (
                    <div className="aspect-video w-full flex flex-col items-center justify-center gap-2 text-slate-500 bg-slate-950/50">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                      <span className="text-[11px]">Loading curated video tutorials...</span>
                    </div>
                  ) : activeVideo ? (
                    <div className="relative aspect-video w-full bg-black">
                      <iframe
                        src={activeVideo.embedUrl}
                        title={activeVideo.title}
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
                          item.youtube_search_query || `${item.theme} tutorial`
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

                  {/* Multi-Video Selector Pills (if 2+ videos available) */}
                  {videos.length > 1 && (
                    <div className="p-2 bg-slate-950/70 border-t border-slate-800/80 flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 px-1">
                        Select Video Guide:
                      </span>
                      <div className="flex flex-col gap-1">
                        {videos.map((vid, vIdx) => {
                          const isSelected = vIdx === activeIdx;
                          return (
                            <button
                              key={vid.videoId || vIdx}
                              onClick={() =>
                                setActiveVideoIdxByWeek((prev) => ({
                                  ...prev,
                                  [item.week]: vIdx,
                                }))
                              }
                              className={`text-left text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                                isSelected
                                  ? "bg-rose-950/40 border-rose-500/40 text-rose-300 font-semibold"
                                  : "bg-slate-900/50 border-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Play className={`h-3 w-3 shrink-0 ${isSelected ? "text-rose-400 fill-rose-400" : "text-slate-500"}`} />
                                <span className="truncate">{vid.title}</span>
                              </div>
                              <span className="text-[10px] shrink-0 text-slate-500 font-normal">
                                {vid.channelTitle}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions: External Shortcuts */}
              <div className="px-6 py-3.5 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    item.youtube_search_query || `${item.theme} tutorial`
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
                    item.coursera_search_query || item.theme
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
