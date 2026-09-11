"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Target,
  BookOpen,
  Briefcase,
  Code2,
  ArrowLeft,
} from "lucide-react";
import { FullAnalysisResponse } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { UploadSection } from "@/components/UploadSection";
import { AnalysisHeader } from "@/components/AnalysisHeader";
import { AnalyzingSkeleton } from "@/components/AnalyzingSkeleton";
import { RoadmapTab } from "@/components/RoadmapTab";
import { JobBoardTab } from "@/components/JobBoardTab";
import { CompanyDSATab } from "@/components/CompanyDSATab";

export default function Home() {
  // Application State Transitions: idle | analyzing | results
  const [appState, setAppState] = useState<"idle" | "analyzing" | "results">("idle");
  const [activeTab, setActiveTab] = useState<"overview" | "roadmap" | "jobs" | "dsa">("overview");

  // Form Inputs
  const [targetRole, setTargetRole] = useState("Senior Backend Engineer");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");

  // Analysis Data & Network States
  const [analysis, setAnalysis] = useState<FullAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Check backend health
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => (res.ok ? setBackendHealthy(true) : setBackendHealthy(false)))
      .catch(() => setBackendHealthy(false));
  }, [API_URL]);

  // Quick Demo Mode Handler
  const handleQuickDemo = async () => {
    setError(null);
    setAppState("analyzing");

    try {
      const res = await fetch(`${API_URL}/api/demo-analysis`);
      if (!res.ok) throw new Error("Demo endpoint returned HTTP " + res.status);
      const data: FullAnalysisResponse = await res.json();
      
      // Smooth animated delay for realistic AI feel
      setTimeout(() => {
        setAnalysis(data);
        setTargetRole(data.target_role);
        setAppState("results");
        setActiveTab("overview");
      }, 750);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load demo";
      setError(`Backend unreachable (${msg}). Please verify backend is running on ${API_URL}`);
      setAppState("idle");
    }
  };

  // Full Analysis Submission Handler
  const handleAnalyze = async () => {
    const finalRole = targetRole.trim();

    if (!finalRole) {
      setError("Please specify a target role or select a popular track.");
      return;
    }

    if (!selectedFile && (!rawText || rawText.trim().length < 30)) {
      setError("Please upload your resume (.pdf) or provide at least 30 characters of resume text.");
      return;
    }

    setError(null);
    setAppState("analyzing");

    try {
      const formData = new FormData();
      formData.append("target_role", finalRole);

      if (selectedFile) {
        formData.append("resume_file", selectedFile);
      } else if (rawText) {
        formData.append("raw_resume_text", rawText.trim());
      }

      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server responded with HTTP ${res.status}`);
      }

      const data: FullAnalysisResponse = await res.json();
      setAnalysis(data);
      setAppState("results");
      setActiveTab("overview");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to complete analysis";
      setError(msg);
      setAppState("idle");
    }
  };

  const handleReset = () => {
    setAppState("idle");
    setAnalysis(null);
    setSelectedFile(null);
    setRawText("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <Navbar
        onQuickDemo={handleQuickDemo}
        backendHealthy={backendHealthy}
        loading={appState === "analyzing"}
      />

      {/* 2. Main Content Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 flex-1">
        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-200 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-white font-semibold text-xs transition-all cursor-pointer"
              >
                Run Quick Demo Instead
              </button>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-xs text-rose-400 hover:text-white underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* STATE 1: IDLE UPLOAD VIEW */}
        {appState === "idle" && (
          <div className="flex flex-col gap-8">
            {/* Hero Banner */}
            <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3 pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Next-Generation Skill-Gap Analytics & Interview Preparation
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Benchmark Your Skills for Your{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                  Target Engineering Role
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-xl">
                Upload your resume, pinpoint missing competencies, track an AI-synthesized 4-week learning roadmap, and solve company-specific algorithm problems.
              </p>
            </div>

            {/* Core Upload Section */}
            <UploadSection
              targetRole={targetRole}
              setTargetRole={setTargetRole}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              rawText={rawText}
              setRawText={setRawText}
              onAnalyze={handleAnalyze}
              loading={false}
            />
          </div>
        )}

        {/* STATE 2: ANALYZING SKELETON */}
        {appState === "analyzing" && <AnalyzingSkeleton />}

        {/* STATE 3: RESULTS DASHBOARD */}
        {appState === "results" && analysis && (
          <div className="flex flex-col gap-6">
            {/* Sub-navigation bar with Back button and Symmetrical Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Evaluate Another Resume</span>
              </button>

              {/* Symmetric Tabs Bar */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeTab === "overview"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Target className="h-3.5 w-3.5" />
                  <span>Overview & Gaps</span>
                </button>

                <button
                  onClick={() => setActiveTab("roadmap")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeTab === "roadmap"
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>4-Week Roadmap</span>
                </button>

                <button
                  onClick={() => setActiveTab("jobs")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeTab === "jobs"
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Live Jobs</span>
                </button>

                <button
                  onClick={() => setActiveTab("dsa")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeTab === "dsa"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>DSA Prep</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENTS */}
            {activeTab === "overview" && <AnalysisHeader analysis={analysis} />}

            {activeTab === "roadmap" && (
              <RoadmapTab
                roadmap={analysis.learning_roadmap}
                targetRole={analysis.target_role}
              />
            )}

            {activeTab === "jobs" && (
              <JobBoardTab initialKeyword={analysis.job_search_keyword} />
            )}

            {activeTab === "dsa" && <CompanyDSATab />}
          </div>
        )}
      </main>

      {/* 3. Symmetrical Global Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SkillBridge. Built for Hackathon Excellence.</p>
          <div className="flex items-center gap-4">
            <span>FastAPI 0.141</span>
            <span>•</span>
            <span>Gemini AI 1.5/3.6 Flash</span>
            <span>•</span>
            <span>Supabase PostgreSQL</span>
            <span>•</span>
            <span>Next.js 16 App Router</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
