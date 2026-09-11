from typing import List, Optional
from fastapi import APIRouter, Query

from app.schemas.dsa import DSAQuestion
from app.services.dsa import get_all_companies, get_dsa_questions

router = APIRouter(prefix="/dsa", tags=["DSA"])


@router.get(
    "/companies",
    response_model=List[str],
    summary="Get List of All Available Hiring Companies",
    description="Retrieve sorted list of all 450+ tech companies available in the consolidated LeetCode question bank."
)
def get_companies() -> List[str]:
    return get_all_companies()


@router.get(
    "",
    response_model=List[DSAQuestion],
    summary="Fetch Consolidated Company DSA Questions",
    description="Retrieve high-frequency LeetCode interview questions across 450+ companies with filtering and pagination."
)
def get_dsa(
    company: Optional[str] = Query(None, description="Filter by company name or preset ('FAANG / Big Tech', 'Indian Unicorns', 'Fintech', or 'All')"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty ('Easy', 'Medium', 'Hard', or 'All')"),
    topic: Optional[str] = Query(None, description="Filter by algorithmic topic/pattern (e.g. 'Array', 'Hash Table', 'Tree', 'Dynamic Programming')"),
    search: Optional[str] = Query(None, description="Search keyword matching problem title or topic"),
    page: int = Query(1, ge=1, description="Page number for pagination"),
    limit: int = Query(50, ge=1, le=200, description="Results per page (default: 50, max: 200)")
) -> List[DSAQuestion]:
    return get_dsa_questions(
        company=company,
        difficulty=difficulty,
        topic=topic,
        search=search,
        page=page,
        limit=limit
    )
