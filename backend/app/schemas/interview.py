from typing import List, Optional
from pydantic import BaseModel, Field


class InterviewGenerateRequest(BaseModel):
    target_role: str = Field(..., description="The candidate's target job role")
    missing_skills: List[str] = Field(default_factory=list, description="Targeted skill gaps identified from analysis")


class InterviewQuestion(BaseModel):
    id: int = Field(..., description="Question index (1, 2, 3)")
    category: str = Field(..., description="Question category: Conceptual, Scenario, or Coding Logic")
    question: str = Field(..., description="The technical interview question text")
    skill_focus: str = Field(..., description="The specific skill or gap being probed")
    hint: Optional[str] = Field(default=None, description="Helpful hint or interviewer guidance")


class InterviewGenerateResponse(BaseModel):
    target_role: str = Field(..., description="Target role")
    questions: List[InterviewQuestion] = Field(..., description="List of 3 targeted interview questions")


class InterviewEvaluateRequest(BaseModel):
    question: str = Field(..., description="The interview question that was asked")
    user_answer: str = Field(..., description="The candidate's written or spoken response")
    target_role: str = Field(default="Software Engineer", description="Target role")
    skill_focus: Optional[str] = Field(default="Technical Competency", description="Specific skill focus")


class InterviewEvaluateResponse(BaseModel):
    score: int = Field(..., ge=1, le=10, description="Evaluation score out of 10")
    verdict: str = Field(default="Strong Response", description="Short performance verdict")
    strengths: List[str] = Field(default_factory=list, description="Things the candidate explained well")
    areas_for_improvement: List[str] = Field(default_factory=list, description="Specific gaps or missing technical points")
    ideal_answer: str = Field(..., description="Gold-standard concise model answer for this question")
