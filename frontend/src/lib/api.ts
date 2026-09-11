import {
  FullAnalysisResponse,
  JobPosting,
  DSAQuestion,
  YouTubeVideoItem,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Upload a PDF resume and trigger full Gemini AI skill-gap analysis.
 */
export async function analyzeResume(
  file: File,
  targetRole: string
): Promise<FullAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("target_role", targetRole);

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`Resume analysis failed (${res.status}): ${errorText}`);
  }

  return res.json();
}

/**
 * Instant demo analysis loader with zero latency.
 */
export async function getDemoAnalysis(): Promise<FullAnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/demo-analysis`);
  if (!res.ok) {
    throw new Error(`Failed to load demo analysis (${res.status})`);
  }
  return res.json();
}

/**
 * Retrieve real-time or cached job openings matching keywords and location.
 */
export async function getJobs(
  keywords: string = "Software Engineer",
  location: string = "Bengaluru, India"
): Promise<JobPosting[]> {
  const params = new URLSearchParams();
  if (keywords.trim()) {
    params.append("keywords", keywords.trim());
    params.append("keyword", keywords.trim());
  }
  if (location.trim()) {
    params.append("location", location.trim());
  }

  const res = await fetch(`${API_BASE}/api/jobs?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Jobs fetch failed (${res.status})`);
  }
  return res.json();
}

/**
 * Retrieve curated company DSA coding problems with optional filtering.
 */
export async function getDSAQuestions(
  company?: string,
  difficulty?: string
): Promise<DSAQuestion[]> {
  const params = new URLSearchParams();
  if (company && company !== "All") params.append("company", company);
  if (difficulty && difficulty !== "All") params.append("difficulty", difficulty);

  const res = await fetch(`${API_BASE}/api/dsa?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`DSA fetch failed (${res.status})`);
  }
  return res.json();
}

/**
 * Retrieve YouTube educational video tutorials for roadmap learning tasks.
 */
export async function searchYouTube(
  query: string,
  maxResults: number = 2
): Promise<YouTubeVideoItem[]> {
  const params = new URLSearchParams({
    q: query.trim(),
    max_results: maxResults.toString(),
  });

  const res = await fetch(`${API_BASE}/api/youtube/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`YouTube tutorial search failed (${res.status})`);
  }
  return res.json();
}
