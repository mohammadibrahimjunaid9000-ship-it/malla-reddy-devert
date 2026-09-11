from typing import List
from fastapi import APIRouter, Query

from app.schemas.jobs import JobPosting
from app.services.jooble import search_jooble_jobs

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get(
    "",
    response_model=List[JobPosting],
    summary="Search Live Job Opportunities",
    description="Retrieve live job postings matching target role keywords and locations with automatic domestic routing and 4s timeout fallback."
)
def get_jobs(
    keywords: str = Query("Software Engineer", description="Target job title or skill keywords"),
    keyword: str = Query(None, description="Alternative alias for keywords"),
    location: str = Query("Bengaluru, India", description="Geographic location or Remote")
) -> List[JobPosting]:
    search_term = keyword or keywords or "Software Engineer"
    loc = location or "Bengaluru, India"
    return search_jooble_jobs(keywords=search_term, location=loc)


