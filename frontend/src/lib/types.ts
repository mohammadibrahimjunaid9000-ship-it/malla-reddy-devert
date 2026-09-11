export interface MissingSkillDetail {
  skill: string;
  importance: "High" | "Medium";
  reason: string;
}

export interface YouTubeVideoItem {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  embedUrl: string;
}

export interface RoadmapItemDetail {
  week: number;
  theme: string;
  task?: string;
  title?: string;
  focus_skills?: string[];
  tasks?: string[];
  search_queries?: string[];
  youtube_search_query?: string;
  coursera_search_query?: string;
  videos?: YouTubeVideoItem[];
}

export interface FullAnalysisResponse {
  id?: string;
  candidate_name: string;
  candidate_level: "Junior" | "Mid" | "Senior" | string;
  target_role: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: MissingSkillDetail[];
  learning_roadmap: RoadmapItemDetail[];
  roadmap?: RoadmapItemDetail[];
  job_search_keyword: string;
  resume_bullet_fixes: string[];
  persisted?: boolean;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  snippet: string;
  url: string;
  apply_url?: string;
  salary?: string;
  posted_date?: string;
}

export interface DSAQuestion {
  id: string;
  company: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  pattern: string;
  leetcode_url: string;
}

export interface InterviewQuestion {
  id: number;
  category: string;
  question: string;
  skill_focus: string;
  hint?: string;
}

export interface InterviewEvaluation {
  score: number;
  verdict: string;
  strengths: string[];
  areas_for_improvement: string[];
  ideal_answer: string;
}

export interface AnalysisSaveResponse {
  id: string;
  share_url: string;
  status: string;
  created_at?: string;
}

