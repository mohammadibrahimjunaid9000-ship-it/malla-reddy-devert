from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class MissingSkill(BaseModel):
    skill: str = Field(..., description="The specific tool, technology, or concept")
    importance: Literal["High", "Medium"] = Field(..., description="Priority level for target role")
    reason: str = Field(..., description="Context for why this skill is needed")


class RoadmapItem(BaseModel):
    week: int = Field(..., description="Sequential week number in the learning pathway")
    theme: str = Field(..., description="Core module or subject theme")
    task: str = Field(..., description="Actionable learning task or hands-on mini-project")
    youtube_search_query: str = Field(..., description="Pre-composed search query for YouTube tutorials")
    coursera_search_query: str = Field(..., description="Pre-composed search query for Coursera courses")


class GapAnalysisResponse(BaseModel):
    id: Optional[str] = Field(default=None, description="Supabase record UUID if persisted")
    candidate_name: str = Field(default="Candidate", description="Detected name of the candidate")
    candidate_level: Literal["Junior", "Mid", "Senior"] = Field(
        default="Junior", description="Assessed seniority level based on resume experience"
    )
    target_role: Optional[str] = Field(default=None, description="The job role analyzed against")
    match_score: int = Field(
        ..., ge=0, le=100, description="Overall match percentage from 0 to 100"
    )
    matched_skills: List[str] = Field(
        default_factory=list, description="Skills verified in the candidate's background"
    )
    missing_skills: List[MissingSkill] = Field(
        default_factory=list, description="Identified technical and domain skill gaps"
    )
    learning_roadmap: List[RoadmapItem] = Field(
        default_factory=list, description="Step-by-step personalized learning curriculum"
    )
    job_search_keyword: str = Field(
        ..., description="Optimized query string for job boards (Jooble, LinkedIn)"
    )
    resume_bullet_fixes: List[str] = Field(
        default_factory=list,
        description="High-impact bullet points rewritten with action verbs and metrics",
    )
    persisted: bool = Field(
        default=False, description="Indicates if record was successfully saved to Supabase"
    )
