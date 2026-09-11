"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Code2,
  ExternalLink,
  Search,
  Building2,
  Filter,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Loader2,
  Layers,
  Flame,
  X,
  Compass,
} from "lucide-react";
import { DSAQuestion } from "@/lib/types";
import { getDSAQuestions, getDSACompanies } from "@/lib/api";

const PRESET_CATEGORIES = ["All", "FAANG / Big Tech", "Indian Unicorns", "Fintech"];
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const FALLBACK_DSA: DSAQuestion[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Array, Hash Table",
    leetcode_url: "https://leetcode.com/problems/two-sum/",
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Uber", "Netflix"],
  },
  {
    id: 146,
    title: "LRU Cache",
    difficulty: "Medium",
    topic: "Hash Table, Linked List, Design",
    leetcode_url: "https://leetcode.com/problems/lru-cache/",
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg", "Apple"],
  },
  {
    id: 56,
    title: "Merge Intervals",
    difficulty: "Medium",
    topic: "Array, Sorting",
    leetcode_url: "https://leetcode.com/problems/merge-intervals/",
    companies: ["Google", "Amazon", "Meta", "Microsoft", "Uber", "Salesforce"],
  },
  {
    id: 42,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topic: "Array, Two Pointers, Dynamic Programming, Stack",
    leetcode_url: "https://leetcode.com/problems/trapping-rain-water/",
    companies: ["Amazon", "Goldman Sachs", "Google", "Meta", "Bloomberg"],
  },
];

export const CompanyDSATab: React.FC = () => {
  const [companiesList, setCompaniesList] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedDiff, setSelectedDiff] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [companySearch, setCompanySearch] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [questions, setQuestions] = useState<DSAQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load companies list on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCompanies() {
      try {
        const companies = await getDSACompanies();
        if (isMounted && Array.isArray(companies) && companies.length > 0) {
          setCompaniesList(companies);
        }
      } catch (err) {
        console.error("Failed to load companies:", err);
      }
    }
    loadCompanies();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine active company filter to query
  const effectiveCompanyParam = useMemo(() => {
    if (selectedCompany) return selectedCompany;
    if (selectedCategory !== "All") return selectedCategory;
    return undefined;
  }, [selectedCompany, selectedCategory]);

  // Fetch questions
  const fetchQuestions = async (pageNum: number, append: boolean = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await getDSAQuestions(
        effectiveCompanyParam,
        selectedDiff !== "All" ? selectedDiff : undefined,
        undefined,
        debouncedSearch.trim() || undefined,
        pageNum,
        40
      );

      if (Array.isArray(data)) {
        if (append) {
          setQuestions((prev) => [...prev, ...data]);
        } else {
          setQuestions(data.length > 0 ? data : (debouncedSearch ? [] : FALLBACK_DSA));
        }
        setHasMore(data.length === 40);
      } else {
        if (!append) setQuestions(FALLBACK_DSA);
        setHasMore(false);
      }
    } catch {
      if (!append) setQuestions(FALLBACK_DSA);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchQuestions(1, false);
  }, [effectiveCompanyParam, selectedDiff, debouncedSearch]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchQuestions(nextPage, true);
  };

  // Filter company dropdown search
  const filteredDropdownCompanies = useMemo(() => {
    if (!companySearch.trim()) return companiesList;
    const q = companySearch.toLowerCase();
    return companiesList.filter((c) => c.toLowerCase().includes(q));
  }, [companiesList, companySearch]);

  return (
    <div className="w-full rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col gap-6">
      {/* Top Header - Symmetrical & Clean */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Code2 className="h-5 w-5" />
            </span>
            <span>Company-Targeted Technical DSA Patterns</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real LeetCode interview frequencies consolidated across 420+ top engineering firms and startups.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {loading ? "Searching..." : `${questions.length} Questions Loaded`}
            </span>
          </span>
        </div>
      </div>

      {/* Symmetrical Search & Filter Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Keyword Search Input */}
        <div className="lg:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by title, pattern, or algorithm (e.g. 'Two Sum', 'Dynamic Programming')..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-950/80 border border-slate-800/90 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Searchable Company Combobox / Dropdown */}
        <div className="lg:col-span-6 relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full py-2.5 px-3.5 bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-xl text-xs text-left flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-400 font-medium">Company:</span>
              <span className="text-white font-semibold truncate">
                {selectedCompany || (selectedCategory !== "All" ? `${selectedCategory} (Preset)` : "All 420+ Companies")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-500 group-hover:text-slate-300">
              {selectedCompany && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCompany("");
                  }}
                  className="p-1 hover:text-rose-400 cursor-pointer"
                  title="Clear specific company"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180 text-emerald-400" : ""
                }`}
              />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-2xl p-2 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
              {/* Internal Search Input */}
              <div className="relative px-1 pt-1">
                <Search className="h-3.5 w-3.5 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  placeholder={`Search ${companiesList.length || 429} companies...`}
                  autoFocus
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Scrollable Company List */}
              <div className="max-h-60 overflow-y-auto space-y-0.5 px-1 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCompany("");
                    setIsDropdownOpen(false);
                    setCompanySearch("");
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                    !selectedCompany
                      ? "bg-emerald-500/15 text-emerald-300 font-semibold"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <span>All Companies (Consolidated)</span>
                  {!selectedCompany && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                </button>

                {filteredDropdownCompanies.map((comp) => {
                  const isSelected = selectedCompany.toLowerCase() === comp.toLowerCase();
                  return (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => {
                        setSelectedCompany(comp);
                        setSelectedCategory("All"); // clear preset category
                        setIsDropdownOpen(false);
                        setCompanySearch("");
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/15 text-emerald-300 font-semibold"
                          : "text-slate-300 hover:bg-slate-900"
                      }`}
                    >
                      <span>{comp}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </button>
                  );
                })}

                {filteredDropdownCompanies.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No company found matching &quot;{companySearch}&quot;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Symmetrical Secondary Filters: Category Presets & Difficulty Pills */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1">
        {/* Quick Filter Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-slate-500" />
            Quick Groups:
          </span>
          {PRESET_CATEGORIES.map((cat) => {
            const isActive = !selectedCompany && selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedCompany("");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                    : "bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800/80"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Difficulty Pills */}
        <div className="flex items-center gap-1.5 self-end md:self-auto">
          <span className="text-xs font-semibold text-slate-400 mr-1.5 flex items-center gap-1">
            <Filter className="h-3 w-3 text-slate-500" />
            Difficulty:
          </span>
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDiff(diff)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedDiff === diff
                  ? diff === "Easy"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                    : diff === "Medium"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/25"
                    : diff === "Hard"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/25"
                    : "bg-slate-700 text-white"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80"
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
          <div className="col-span-1 md:col-span-2 py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            <span className="text-xs font-medium">Loading algorithm patterns from 150+ companies...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="col-span-1 md:col-span-2 py-16 px-4 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80 flex flex-col items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
              <Search className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">No DSA problems matched your filters</h4>
            <p className="text-xs text-slate-400 max-w-md">
              Try adjusting your search query, selecting &quot;All&quot; companies, or loosening difficulty constraints.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCompany("");
                setSelectedCategory("All");
                setSelectedDiff("All");
              }}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          questions.map((q) => {
            const companyList = q.companies && q.companies.length > 0
              ? q.companies
              : q.company
              ? [q.company]
              : [];
            const displayCompanies = companyList.slice(0, 4);
            const remainingCount = Math.max(0, companyList.length - 4);
            const topicText = q.topic || q.pattern || "Algorithms";

            return (
              <div
                key={`${q.id}-${q.title}`}
                className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 shadow-lg flex flex-col justify-between gap-4 transition-all group"
              >
                <div className="flex flex-col gap-3">
                  {/* Problem ID & Difficulty Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                        #{q.id}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Layers className="h-3 w-3 text-slate-500" />
                        <span className="truncate max-w-[200px]">{topicText}</span>
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        q.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                          : q.difficulty === "Medium"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  {/* Problem Title */}
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {q.title}
                  </h4>

                  {/* Asked in Companies Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Asked by:
                    </span>
                    {displayCompanies.map((c) => {
                      const isHighlighted =
                        selectedCompany &&
                        c.toLowerCase() === selectedCompany.toLowerCase();
                      return (
                        <span
                          key={c}
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                            isHighlighted
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
                              : "bg-slate-900/90 text-slate-300 border-slate-800"
                          }`}
                        >
                          {c}
                        </span>
                      );
                    })}
                    {remainingCount > 0 && (
                      <span
                        className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800"
                        title={companyList.slice(4).join(", ")}
                      >
                        +{remainingCount} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer: Frequency & Action Button */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-emerald-400/80" />
                    <span>In {companyList.length} company question banks</span>
                  </div>

                  <a
                    href={q.leetcode_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex-shrink-0"
                  >
                    <span>Solve on LeetCode</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More Button for Pagination */}
      {!loading && hasMore && questions.length > 0 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                <span>Loading more problems...</span>
              </>
            ) : (
              <>
                <span>Load More Problems</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
