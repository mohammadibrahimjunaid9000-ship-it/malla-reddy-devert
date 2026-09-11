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
  task: string;
  youtube_search_query: string;
  coursera_search_query: string;
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
