from typing import List, Optional
from fastapi import APIRouter, Query

from app.schemas.dsa import DSAQuestion
from app.services.dsa import get_dsa_questions

router = APIRouter(prefix="/dsa", tags=["DSA"])


@router.get(
    "",
    response_model=List[DSAQuestion],
    summary="Fetch Curated Company DSA Questions",
    description="Retrieve high-frequency technical interview questions categorized across top tech companies (Google, Amazon, Microsoft, Meta, Uber, Netflix)."
)
def get_dsa(
    company: Optional[str] = Query(None, description="Filter by company (Google, Amazon, Microsoft, Meta, Uber, Netflix, or 'All')"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (Easy, Medium, Hard, or 'All')")
) -> List[DSAQuestion]:
    return get_dsa_questions(company=company, difficulty=difficulty)

