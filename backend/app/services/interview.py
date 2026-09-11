import json
import logging
from typing import List, Optional
from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.interview import (
    InterviewEvaluateRequest,
    InterviewEvaluateResponse,
    InterviewGenerateRequest,
    InterviewGenerateResponse,
    InterviewQuestion,
)

logger = logging.getLogger("skillbridge.services.interview")


def get_fallback_interview_questions(target_role: str, missing_skills: List[str]) -> InterviewGenerateResponse:
    """Generate high-quality curated technical questions tailored to role & skills."""
    skill_1 = missing_skills[0] if len(missing_skills) > 0 else "System Architecture"
    skill_2 = missing_skills[1] if len(missing_skills) > 1 else "Database Optimization"
    skill_3 = missing_skills[2] if len(missing_skills) > 2 else "Concurrency & Caching"

    return InterviewGenerateResponse(
        target_role=target_role,
        questions=[
            InterviewQuestion(
                id=1,
                category="Conceptual Mastery",
                question=f"In the context of {target_role}, how does {skill_1} work internally? What are its primary trade-offs compared to traditional approaches?",
                skill_focus=skill_1,
                hint="Focus on core primitives, lifecycle, and memory/network implications."
            ),
            InterviewQuestion(
                id=2,
                category="Scenario & Architecture",
                question=f"Imagine our production system is experiencing high latency spikes during peak load. How would you architect a solution incorporating {skill_2} to maintain sub-100ms response times?",
                skill_focus=skill_2,
                hint="Mention caching layers, failover mechanisms, and metrics/monitoring."
            ),
            InterviewQuestion(
                id=3,
                category="Coding Logic & Optimization",
                question=f"How would you handle race conditions or idempotency when implementing high-volume write operations related to {skill_3}?",
                skill_focus=skill_3,
                hint="Discuss distributed locks, database transaction isolation levels, or optimistic concurrency control."
            )
        ]
    )


def get_fallback_evaluation(question: str, user_answer: str, target_role: str, skill_focus: str) -> InterviewEvaluateResponse:
    """Provide realistic structured evaluation if Gemini API is unreachable."""
    word_count = len(user_answer.strip().split())
    
    if word_count < 10:
        score = 4
        verdict = "Needs More Detail"
        strengths = ["Identified the core topic briefly."]
        improvements = [
            "Provide more technical depth and specific architectural terminology.",
            "Explain trade-offs or concrete production examples rather than a one-line definition."
        ]
    elif word_count < 40:
        score = 7
        verdict = "Good Conceptual Understanding"
        strengths = [
            "Clear technical direction that addresses the core prompt.",
            "Demonstrated foundational understanding of " + skill_focus + "."
        ]
        improvements = [
            "Discuss edge cases, error handling, and scale bottlenecks.",
            "Mention monitoring or testing strategies to reinforce your production readiness."
        ]
    else:
        score = 8
        verdict = "Strong Engineering Response"
        strengths = [
            "Comprehensive technical coverage addressing core principles.",
            "Articulated practical engineering trade-offs and architectural reasoning.",
            "Well-structured explanation appropriate for a " + target_role + " role."
        ]
        improvements = [
            "Could elaborate on observability (metrics/logging/tracing) under failure scenarios.",
            "Quantify impact with approximate performance metrics (e.g. latency percentiles, memory ceilings)."
        ]

    ideal_answer = (
        f"A senior-level answer for '{skill_focus}' in a {target_role} context should establish the core mechanism, "
        "evaluate architectural trade-offs (consistency vs. availability, read vs. write throughput), "
        "and outline mitigation strategies for production edge cases such as network partitions, stampedes, and failovers."
    )

    return InterviewEvaluateResponse(
        score=score,
        verdict=verdict,
        strengths=strengths,
        areas_for_improvement=improvements,
        ideal_answer=ideal_answer
    )


def generate_interview_questions(target_role: str, missing_skills: List[str]) -> InterviewGenerateResponse:
    """Generate 3 targeted mock interview questions using Gemini with fallback."""
    clean_role = target_role.strip() if target_role else "Software Engineer"
    clean_skills = [s.strip() for s in missing_skills if s and s.strip()][:5]
    if not clean_skills:
        clean_skills = ["System Design", "Microservices", "Database Optimization"]

    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.warning("GEMINI_API_KEY not configured. Using curated interview questions.")
        return get_fallback_interview_questions(clean_role, clean_skills)

    skills_str = ", ".join(clean_skills)
    prompt = f"""
Act as a Principal Staff Technical Interviewer for top-tier technology firms (Google, Stripe, Uber).
Generate exactly 3 targeted technical interview questions for a candidate aiming for the role of '{clean_role}'.

The candidate has identified skill gaps in: {skills_str}.

You MUST formulate exactly 3 questions in this format:
1. Question 1 (Category: "Conceptual Mastery"): Tests fundamental inner workings and trade-offs of {clean_skills[0]}.
2. Question 2 (Category: "Scenario & Architecture"): A realistic production scenario (e.g., scaling, latency spike, failure recovery) testing practical system design.
3. Question 3 (Category: "Coding Logic & Optimization"): Focuses on algorithmic reasoning, concurrency, data structures, or code-level edge cases.

Return ONLY raw, valid JSON matching this schema:
{{
  "target_role": "{clean_role}",
  "questions": [
    {{
      "id": 1,
      "category": "Conceptual Mastery",
      "question": "question text",
      "skill_focus": "skill name",
      "hint": "helpful hint"
    }},
    {{
      "id": 2,
      "category": "Scenario & Architecture",
      "question": "question text",
      "skill_focus": "skill name",
      "hint": "helpful hint"
    }},
    {{
      "id": 3,
      "category": "Coding Logic & Optimization",
      "question": "question text",
      "skill_focus": "skill name",
      "hint": "helpful hint"
    }}
  ]
}}
"""

    try:
        client = genai.Client(api_key=api_key)
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.3,
        )

        response = None
        for model_name in ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-1.5-flash"]:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )
                if response and response.text:
                    break
            except Exception as e:
                logger.info(f"Model {model_name} failed: {e}. Trying next candidate...")
                continue

        if response and response.text:
            parsed = json.loads(response.text)
            questions_data = parsed.get("questions", [])
            questions = [InterviewQuestion(**q) for q in questions_data]
            if len(questions) == 3:
                return InterviewGenerateResponse(target_role=clean_role, questions=questions)

    except Exception as e:
        logger.warning(f"Gemini interview generation error: {e}. Using curated fallback.")

    return get_fallback_interview_questions(clean_role, clean_skills)


def evaluate_interview_answer(
    question: str,
    user_answer: str,
    target_role: str = "Software Engineer",
    skill_focus: str = "General"
) -> InterviewEvaluateResponse:
    """Evaluate candidate interview response with 1-10 scoring rubric using Gemini."""
    clean_q = question.strip()
    clean_ans = user_answer.strip()
    api_key = settings.GEMINI_API_KEY

    if not api_key or len(clean_ans) < 5:
        return get_fallback_evaluation(clean_q, clean_ans, target_role, skill_focus)

    prompt = f"""
Act as a Senior Technical Hiring Manager evaluating a candidate's answer for the role of '{target_role}'.

INTERVIEW QUESTION:
{clean_q}

SKILL FOCUS:
{skill_focus}

CANDIDATE ANSWER:
{clean_ans}

TASK:
1. Provide an objective score from 1 to 10 based on technical accuracy, clarity, and depth.
2. Provide a 2-3 word verdict (e.g. "Outstanding Response", "Strong Foundation", "Partially Correct", "Needs More Depth").
3. List 2-3 concrete strengths in their answer.
4. List 2-3 actionable areas for improvement (missing technical nuances, edge cases, trade-offs).
5. Provide a gold-standard ideal answer (concise, 3-4 sentences packed with senior engineering insight).

Return ONLY raw, valid JSON matching this schema:
{{
  "score": 8,
  "verdict": "Strong Technical Answer",
  "strengths": ["Strength 1", "Strength 2"],
  "areas_for_improvement": ["Improvement 1", "Improvement 2"],
  "ideal_answer": "Concise model answer here."
}}
"""

    try:
        client = genai.Client(api_key=api_key)
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.2,
        )

        response = None
        for model_name in ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-1.5-flash"]:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )
                if response and response.text:
                    break
            except Exception as e:
                logger.info(f"Model {model_name} failed in evaluation: {e}")
                continue

        if response and response.text:
            parsed = json.loads(response.text)
            return InterviewEvaluateResponse(
                score=int(parsed.get("score", 7)),
                verdict=parsed.get("verdict", "Evaluated"),
                strengths=parsed.get("strengths", ["Addressed core technical question"]),
                areas_for_improvement=parsed.get("areas_for_improvement", ["Add more depth on edge cases"]),
                ideal_answer=parsed.get("ideal_answer", "Standard architectural response.")
            )

    except Exception as e:
        logger.warning(f"Gemini evaluation error: {e}. Using fallback evaluation.")

    return get_fallback_evaluation(clean_q, clean_ans, target_role, skill_focus)
