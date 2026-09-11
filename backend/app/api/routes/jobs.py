from typing import List
from fastapi import APIRouter, Query

from app.schemas.jobs import JobPosting
from app.services.jooble import search_jooble_jobs

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get(
    "",
    response_model=List[JobPosting],
    summary="Search Live Job Opportunities",
    description="Retrieve live job postings from Jooble API matching target role keywords and locations with automatic 4s timeout fallback."
)
def get_jobs(
    keywords: str = Query(None, description="Target job title or skill keywords"),
    keyword: str = Query(None, description="Alternative alias for keywords"),
    location: str = Query("Remote", description="Geographic location or Remote")
) -> List[JobPosting]:
    search_term = keywords or keyword or "Software Engineer"
    return search_jooble_jobs(keywords=search_term, location=location)

