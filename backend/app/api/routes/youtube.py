from typing import List
from fastapi import APIRouter, Query

from app.schemas.youtube import YouTubeVideoItem
from app.services.youtube import search_youtube_tutorials

router = APIRouter(prefix="/youtube", tags=["YouTube"])


@router.get(
    "/search",
    response_model=List[YouTubeVideoItem],
    summary="Search YouTube Educational Tutorials",
    description="Retrieve live or cached high-impact video tutorials matching roadmap queries with automated fallback protection."
)
def get_youtube_tutorials(
    q: str = Query(..., description="Query keyword or skill topic to search tutorials for"),
    max_results: int = Query(3, ge=1, le=5, description="Number of video tutorials to retrieve (1-5)")
) -> List[YouTubeVideoItem]:
    return search_youtube_tutorials(query=q, max_results=max_results)
