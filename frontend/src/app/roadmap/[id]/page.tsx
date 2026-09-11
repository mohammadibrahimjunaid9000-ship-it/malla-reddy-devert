"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BrainCircuit,
  Share2,
  Check,
  ArrowLeft,
  BookOpen,
  Briefcase,
  Code2,
  FileText,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { FullAnalysisResponse } from "@/lib/types";
import { getSavedAnalysis } from "@/lib/api";
import { AnalysisHeader } from "@/components/AnalysisHeader";
import { RoadmapTab } from "@/components/RoadmapTab";
import { JobBoardTab } from "@/components/JobBoardTab";
import { CompanyDSATab } from "@/components/CompanyDSATab";

export default function SharedRoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params?.id as string;

  const [analysis, setAnalysis] = useState<FullAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "roadmap" | "jobs" | "dsa">("overview");

  useEffect(() => {
    if (!analysisId) return;

    setLoading(true);
    getSavedAnalysis(analysisId)
      .then((data) => {
        setAnalysis(data);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load shared roadmap";
        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [analysisId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Sticky Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">
                SkillBridge
              </span>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Public Shared Link
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 text-indigo-400" />
                  <span>Copy Shareable Link</span>
                </>
              )}
            </button>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>Create Your Own</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full flex flex-col gap-6">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="text-base font-semibold text-white">Loading verified career pathway...</p>
            <p className="text-xs text-slate-400">Fetching roadmap record from Supabase Cloud</p>
          </div>
        ) : error || !analysis ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Pathway Not Found</h4>
            <p className="text-xs text-slate-400">
              {error || "The shareable link might have expired or does not exist."}
            </p>
            <Link
              href="/"
              className="mt-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to SkillBridge Home</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Top Analysis Header with Ring Match Score */}
            <AnalysisHeader analysis={analysis} />

            {/* Symmetrical Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === "overview"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span>Executive Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("roadmap")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === "roadmap"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>
                  {analysis
                    ? `${(analysis.learning_roadmap || analysis.roadmap)?.length || 4}-Week Pathway & Videos`
                    : "Learning Pathway & Videos"}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("jobs")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === "jobs"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Briefcase className="h-4 w-4 text-cyan-400" />
                <span>Live Job Board</span>
              </button>

              <button
                onClick={() => setActiveTab("dsa")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === "dsa"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span>Company DSA Radar</span>
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Matched Strengths */}
                <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Verified Candidate Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matched_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skill Gaps */}
                <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    Prioritized Technical Gaps
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {analysis.missing_skills.map((gap, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{gap.skill}</span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              gap.importance === "High"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {gap.importance}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{gap.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resume Bullet Rewrites */}
                <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    XYZ Metric-Driven Bullet Rewrites
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {analysis.resume_bullet_fixes.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono"
                      >
                        "{bullet}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "roadmap" && (
              <RoadmapTab roadmap={analysis.learning_roadmap} targetRole={analysis.target_role} />
            )}

            {activeTab === "jobs" && (
              <JobBoardTab initialKeyword={analysis.job_search_keyword || analysis.target_role} />
            )}

            {activeTab === "dsa" && <CompanyDSATab />}
          </>
        )}
      </div>
    </main>
  );
}
