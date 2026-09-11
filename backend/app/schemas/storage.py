from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.analysis import MissingSkill, RoadmapItem


class AnalysisSaveRequest(BaseModel):
    id: Optional[str] = None
    candidate_name: str = Field(default="Candidate", description="Detected name of the candidate")
    candidate_level: str = Field(default="Mid", description="Candidate seniority level")
    target_role: str = Field(..., description="Target role analyzed against")
    match_score: int = Field(..., ge=0, le=100, description="Match score from 0 to 100")
    matched_skills: List[str] = Field(default_factory=list, description="Verified candidate skills")
    missing_skills: List[MissingSkill] = Field(default_factory=list, description="Skill gaps")
    learning_roadmap: List[RoadmapItem] = Field(default_factory=list, description="Curated roadmap")
    job_search_keyword: str = Field(default="Software Engineer", description="Job search keyword")
    resume_bullet_fixes: List[str] = Field(default_factory=list, description="Resume bullet suggestions")


class AnalysisSaveResponse(BaseModel):
    id: str = Field(..., description="Unique persistent identifier (UUID)")
    share_url: str = Field(..., description="Shareable public pathway link")
    status: str = Field(default="saved", description="Persistence status (saved or local_cached)")
    created_at: Optional[str] = Field(default=None, description="Timestamp of record creation")
