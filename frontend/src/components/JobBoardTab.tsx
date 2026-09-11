"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Search,
  MapPin,
  ExternalLink,
  Building,
  Loader2,
  Sparkles,
} from "lucide-react";
import { JobPosting } from "@/lib/types";
import { getJobs } from "@/lib/api";

interface JobBoardTabProps {
  initialKeyword: string;
}

export const JobBoardTab: React.FC<JobBoardTabProps> = ({ initialKeyword }) => {
  const [keyword, setKeyword] = useState(initialKeyword || "Software Engineer");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchJobs = async (kw: string, loc: string) => {
    setLoading(true);
    try {
      const data = await getJobs(kw, loc);
      if (Array.isArray(data)) {
        setJobs(data);
      } else {
        setJobs([]);
      }
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  useEffect(() => {
    const defaultTerm = initialKeyword && initialKeyword.trim() ? initialKeyword.trim() : "Software Engineer";
    setKeyword(defaultTerm);
    fetchJobs(defaultTerm, "");
  }, [initialKeyword]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(keyword, location);
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-cyan-400" />
            <span>Live Job Board &amp; Career Opportunities</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real vacancies aggregated directly from the Jooble REST API.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 self-start sm:self-auto">
          {loading ? "Searching openings..." : `Showing ${jobs.length} Matching Openings`}
        </span>
      </div>

      {/* Dual Search Bar (Keyword + Location) */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by job title, skill, or keyword (e.g. Python, React, FastAPI)..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 text-xs sm:text-sm outline-none transition-all"
          />
        </div>

        <div className="relative sm:w-64">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g. India, Remote, Bengaluru)..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 text-xs sm:text-sm outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span>Find Jobs</span>
        </button>
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/60 animate-pulse flex flex-col gap-3"
            >
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-6 bg-slate-800 rounded w-2/3" />
              <div className="h-3 bg-slate-800 rounded w-1/4" />
              <div className="h-16 bg-slate-800/50 rounded w-full mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State (100% Genuine - Zero Fake Data) */}
      {!loading && jobs.length === 0 && hasSearched && (
        <div className="w-full py-16 px-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <div className="max-w-md">
            <h4 className="text-base font-bold text-slate-200">
              No active openings found matching these exact keywords in this region.
            </h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Try adjusting your search query, or specify broader keywords like "Full Stack", "Python", or location like "India" or "Remote".
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {["Software Engineer", "Python Developer", "Full Stack Developer", "Remote"].map((suggested) => (
              <button
                key={suggested}
                type="button"
                onClick={() => {
                  setKeyword(suggested);
                  setLocation("");
                  fetchJobs(suggested, "");
                }}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all font-medium cursor-pointer"
              >
                Try "{suggested}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Symmetrical Grid of Live Job Cards */}
      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const applyLink = job.apply_url || job.url || "https://jooble.org";
            const isDisclosed = job.salary && job.salary.toLowerCase() !== "disclosed on application" && job.salary.toLowerCase() !== "not specified";

            return (
              <div
                key={job.id}
                className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 shadow-lg flex flex-col justify-between gap-4 transition-all"
              >
                <div>
                  {/* Company & Location Pill */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 truncate">
                      <Building className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{job.company}</span>
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1 shrink-0">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      <span>{job.location}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-bold text-white mb-1.5 leading-snug">{job.title}</h4>

                  {/* Salary Status */}
                  <div className="mb-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border inline-block ${
                        isDisclosed
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 font-mono"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      {job.salary || "Disclosed on Application"}
                    </span>
                  </div>

                  {/* Snippet */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {job.snippet}
                  </p>
                </div>

                {/* Bottom: Direct Apply Link to Jooble Source */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Live Jooble Vacancy</span>

                  <a
                    href={applyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/20"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
