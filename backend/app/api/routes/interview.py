import logging
from fastapi import APIRouter, HTTPException

from app.schemas.interview import (
    InterviewEvaluateRequest,
    InterviewEvaluateResponse,
    InterviewGenerateRequest,
    InterviewGenerateResponse,
)
from app.services.interview import evaluate_interview_answer, generate_interview_questions

logger = logging.getLogger("skillbridge.api.interview")

router = APIRouter(prefix="/interview", tags=["Mock Interview"])


@router.post(
    "/generate",
    response_model=InterviewGenerateResponse,
    summary="Generate 3 Targeted Mock Interview Questions",
    description="Uses Gemini to generate 3 targeted questions covering Conceptual, Scenario, and Coding Logic based on candidate's skill gaps."
)
def generate_questions(payload: InterviewGenerateRequest) -> InterviewGenerateResponse:
    try:
        return generate_interview_questions(payload.target_role, payload.missing_skills)
    except Exception as e:
        logger.error(f"Error generating interview questions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")


@router.post(
    "/evaluate",
    response_model=InterviewEvaluateResponse,
    summary="Evaluate Candidate Answer with 1-10 Rubric",
    description="Uses Gemini to assess accuracy, depth, and communication, returning scores, strengths, weaknesses, and ideal answers."
)
def evaluate_answer(payload: InterviewEvaluateRequest) -> InterviewEvaluateResponse:
    try:
        return evaluate_interview_answer(
            question=payload.question,
            user_answer=payload.user_answer,
            target_role=payload.target_role,
            skill_focus=payload.skill_focus or "General"
        )
    except Exception as e:
        logger.error(f"Error evaluating interview answer: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to evaluate answer: {str(e)}")
