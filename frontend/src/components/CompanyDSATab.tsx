"use client";

import React, { useState, useEffect } from "react";
import {
  Code2,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle,
  Building2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { DSAQuestion } from "@/lib/types";

const COMPANIES = ["All", "Google", "Amazon", "Microsoft", "Meta", "Uber", "Netflix"];
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const FALLBACK_DSA: DSAQuestion[] = [
  {
    id: "fb-1",
    company: "Google",
    title: "LRU Cache Design",
    difficulty: "Medium",
    pattern: "Hash Table & Doubly Linked List",
    leetcode_url: "https://leetcode.com/problems/lru-cache/",
  },
  {
    id: "fb-2",
    company: "Google",
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    pattern: "Min-Heap / Priority Queue",
    leetcode_url: "https://leetcode.com/problems/merge-k-sorted-lists/",
  },
  {
    id: "fb-3",
    company: "Amazon",
    title: "Course Schedule II (Build Order)",
    difficulty: "Medium",
    pattern: "Topological Sort & Kahn's Algorithm",
    leetcode_url: "https://leetcode.com/problems/course-schedule-ii/",
  },
  {
    id: "fb-4",
    company: "Amazon",
    title: "Word Break (Dynamic Programming)",
    difficulty: "Medium",
    pattern: "1D Dynamic Programming & Trie",
    leetcode_url: "https://leetcode.com/problems/word-break/",
  },
  {
    id: "fb-5",
    company: "Meta",
    title: "Lowest Common Ancestor of a Binary Tree",
    difficulty: "Medium",
    pattern: "Recursive DFS & Tree Traversal",
    leetcode_url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
  },
  {
    id: "fb-6",
    company: "Meta",
    title: "Word Ladder (Shortest Transformation)",
    difficulty: "Hard",
    pattern: "Bidirectional Breadth-First Search (BFS)",
    leetcode_url: "https://leetcode.com/problems/word-ladder/",
  },
];

export const CompanyDSATab: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedDiff, setSelectedDiff] = useState("All");
  const [questions, setQuestions] = useState<DSAQuestion[]>(FALLBACK_DSA);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchQuestions = async (company: string, diff: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (company !== "All") params.append("company", company);
      if (diff !== "All") params.append("difficulty", diff);

      const res = await fetch(`${API_URL}/api/dsa?${params.toString()}`);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
      } else {
        setQuestions(FALLBACK_DSA);
      }
    } catch {
      setQuestions(FALLBACK_DSA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(selectedCompany, selectedDiff);
  }, [selectedCompany, selectedDiff]);

  return (
    <div className="w-full rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="h-5 w-5 text-emerald-400" />
            Company-Targeted Technical DSA Patterns
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Curated high-frequency coding questions filtered for top engineering companies.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
          Showing {questions.length} Curated Questions
        </span>
      </div>

      {/* Symmetrical Company Filter Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Company Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            Company:
          </span>
          {COMPANIES.map((company) => (
            <button
              key={company}
              onClick={() => setSelectedCompany(company)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCompany === company
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {company}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1">Level:</span>
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDiff(diff)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedDiff === diff
                  ? "bg-slate-700 text-white font-bold"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Symmetrical Grid of DSA Problem Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
            <span className="text-xs font-medium">Filtering curated algorithms...</span>
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 shadow-lg flex flex-col justify-between gap-4 transition-all"
            >
              <div>
                {/* Company Tag & Difficulty Badge */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                    <Building2 className="h-3 w-3 text-emerald-400" />
                    {q.company}
                  </span>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      q.difficulty === "Easy"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : q.difficulty === "Medium"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                {/* Problem Title */}
                <h4 className="text-base font-bold text-white mb-2">{q.title}</h4>

                {/* Core Pattern Pill */}
                <div className="text-xs text-slate-400 font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500">Pattern: </span>
                  <span className="text-emerald-300 font-medium">{q.pattern}</span>
                </div>
              </div>

              {/* Direct LeetCode Link */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Interview Frequency: Very High</span>

                <a
                  href={q.leetcode_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20"
                >
                  <span>Solve on LeetCode</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
