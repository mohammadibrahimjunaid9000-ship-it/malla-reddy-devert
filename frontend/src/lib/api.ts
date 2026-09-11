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

/**
 * Persist an analysis record into Supabase to generate a shareable URL.
 */
export async function saveAnalysis(
  analysis: FullAnalysisResponse
): Promise<{ id: string; share_url: string; status: string }> {
  const res = await fetch(`${API_BASE}/api/analyses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(analysis),
  });

  if (!res.ok) {
    throw new Error(`Failed to save analysis (${res.status})`);
  }

  return res.json();
}

/**
 * Retrieve a saved analysis by UUID for public shareable viewing.
 */
export async function getSavedAnalysis(id: string): Promise<FullAnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/analyses/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Analysis not found or link has expired (${res.status})`);
  }
  return res.json();
}

/**
 * Generate 3 tailored mock interview questions based on candidate skill gaps.
 */
export async function generateInterviewQuestions(
  targetRole: string,
  missingSkills: string[]
): Promise<{ target_role: string; questions: import("./types").InterviewQuestion[] }> {
  const res = await fetch(`${API_BASE}/api/interview/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target_role: targetRole,
      missing_skills: missingSkills,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate interview questions (${res.status})`);
  }

  return res.json();
}

/**
 * Submit candidate's answer for Gemini AI scoring and structured feedback.
 */
export async function evaluateInterviewAnswer(
  question: string,
  userAnswer: string,
  targetRole: string,
  skillFocus?: string
): Promise<import("./types").InterviewEvaluation> {
  const res = await fetch(`${API_BASE}/api/interview/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      user_answer: userAnswer,
      target_role: targetRole,
      skill_focus: skillFocus || "General",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to evaluate interview response (${res.status})`);
  }

  return res.json();
}

