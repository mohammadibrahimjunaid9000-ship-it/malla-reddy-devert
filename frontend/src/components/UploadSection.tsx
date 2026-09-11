"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
  X,
  Code,
  Briefcase,
  ChevronDown,
  Search,
} from "lucide-react";

export const COMPREHENSIVE_CAREER_TRACKS = [
  // Backend & Infrastructure
  "Senior Backend Engineer",
  "Distributed Systems Engineer",
  "Cloud & DevOps Architect",
  "Site Reliability Engineer (SRE)",
  "Platform & Infrastructure Engineer",
  
  // Full Stack & Web
  "Full Stack Developer",
  "Frontend Architecture Engineer",
  "Mobile App Developer (React Native / iOS / Flutter)",
  
  // AI, ML & Data
  "AI Systems & LLM Engineer",
  "Machine Learning Engineer (MLOps)",
  "Data Engineer (Pipelines & Warehousing)",
  "Data Scientist & AI Analytics",
  "Computer Vision & NLP Specialist",
  
  // Security & Specialized
  "Cybersecurity & Penetration Testing Specialist",
  "Technical Product Manager (AI Products)",
  "QA Automation & SDET Engineer",
  "Blockchain & Web3 Protocol Engineer",
  "Embedded Systems & Firmware Developer",
];

export const POPULAR_CHIPS = [
  "Senior Backend Engineer",
  "AI Systems & LLM Engineer",
  "Full Stack Developer",
  "Cloud & DevOps Architect",
  "Data Engineer",
  "Cybersecurity Specialist",
];

export const SAMPLE_CS_RESUME = `Alex Chen
Computer Science Graduate | Software Engineer
Skills: Python, TypeScript, React, Node.js, Express, PostgreSQL, Git, Docker fundamentals, REST APIs, Data Structures & Algorithms.
Experience:
- Built a full-stack e-commerce web platform with React, Node.js, and PostgreSQL handling user auth and Stripe checkout.
- Developed an automated web scraper with Python and BeautifulSoup to extract real-time flight pricing into SQLite.
- Completed 250+ LeetCode problems covering Binary Trees, Graphs, and Dynamic Programming.`;

interface UploadSectionProps {
  targetRole: string;
  setTargetRole: (role: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  rawText: string;
  setRawText: (text: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  targetRole,
  setTargetRole,
  selectedFile,
  setSelectedFile,
  rawText,
  setRawText,
  onAnalyze,
  loading,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith(".pdf")) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const loadSampleResume = () => {
    setSelectedFile(null);
    setRawText(SAMPLE_CS_RESUME);
    if (!targetRole) {
      setTargetRole("Full Stack Developer");
    }
  };

  // Filter career tracks based on user typing
  const filteredTracks = COMPREHENSIVE_CAREER_TRACKS.filter((track) =>
    track.toLowerCase().includes((filterQuery || targetRole || "").toLowerCase())
  );

  const displayTracks =
    filteredTracks.length > 0 ? filteredTracks : COMPREHENSIVE_CAREER_TRACKS;

  return (
    <div className="w-full rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col gap-6">
      {/* Top Bar with CS Student Sample Resume Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-400" />
            Resume Skill Assessment & Gap Analyzer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Type or select any career role, upload your resume, and benchmark against industry bars.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSampleResume}
          className="self-start sm:self-auto text-xs px-3.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 transition-all flex items-center gap-1.5 font-semibold cursor-pointer"
        >
          <Code className="h-3.5 w-3.5 text-indigo-400" />
          Use Sample CS Student Resume
        </button>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editable Combobox with Dropdown & Popular Chips */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div ref={dropdownRef} className="relative">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Target Career Role
              </label>
              <span className="text-[11px] text-indigo-400 font-medium">
                Type freely or choose below
              </span>
            </div>

            {/* Typeable Input with Embedded Dropdown Toggle */}
            <div className="relative">
              <input
                type="text"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  setFilterQuery(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => {
                  setFilterQuery("");
                  setDropdownOpen(true);
                }}
                placeholder="Type any role (e.g. Senior Backend Engineer)..."
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 text-sm font-medium outline-none transition-all placeholder-slate-500 shadow-inner"
              />

              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Toggle career tracks list"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180 text-indigo-400" : ""
                  }`}
                />
              </button>
            </div>

            {/* Dropdown Options Menu */}
            {dropdownOpen && (
              <div className="absolute z-40 left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 shadow-2xl backdrop-blur-xl p-1.5 flex flex-col gap-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800/80 flex items-center justify-between">
                  <span>Available Career Tracks ({displayTracks.length})</span>
                  <span className="text-slate-600 font-normal">Click to select</span>
                </div>

                {displayTracks.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setTargetRole(role);
                      setFilterQuery("");
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      targetRole.toLowerCase() === role.toLowerCase()
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <span>{role}</span>
                    {targetRole.toLowerCase() === role.toLowerCase() && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Selection Popular Tracks */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Select Popular Tracks
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setTargetRole(chip);
                    setDropdownOpen(false);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    targetRole === chip
                      ? "bg-indigo-600 text-white font-semibold shadow-sm"
                      : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-800"
                  }`}
                >
                  {chip.replace("Senior ", "").replace(" & LLM", "")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Drag-and-Drop Dropzone & Fallback Textarea */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Resume Source File (.PDF or Text)
          </label>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              selectedFile
                ? "border-emerald-500/60 bg-emerald-950/20"
                : "border-slate-800 hover:border-indigo-500/50 bg-slate-950/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-emerald-300 block">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Upload className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-slate-200">
                  Drag and drop your PDF resume here
                </span>
                <span className="text-xs text-slate-500">
                  Supports modern PDF resumes up to 10MB
                </span>
              </div>
            )}
          </div>

          {/* Raw Text Fallback Textarea */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Or paste resume text</span>
              {rawText && (
                <button
                  type="button"
                  onClick={() => setRawText("")}
                  className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                >
                  Clear text
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                if (selectedFile) setSelectedFile(null);
              }}
              placeholder="Paste your resume sections, skills, work history, or education here..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-600 text-xs outline-none transition-all resize-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="pt-4 border-t border-slate-800/80 flex justify-end">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing Skill Gap with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-indigo-200" />
              <span>Analyze Skill Gap & Build Pathway</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
