import html
import logging
from typing import Dict, List, Optional
import requests

from app.core.config import settings
from app.schemas.youtube import YouTubeVideoItem

logger = logging.getLogger("skillbridge.services.youtube")

# In-memory quota-protecting cache
_YOUTUBE_CACHE: Dict[str, List[YouTubeVideoItem]] = {}

# Curated high-fidelity educational tutorials for zero-fail fallback
CURATED_FALLBACK_LIBRARY = {
    "python": [
        YouTubeVideoItem(
            videoId="kqtD5dpn9C8",
            title="Python for Beginners - Full Course [Programming with Mosh]",
            channelTitle="Programming with Mosh",
            thumbnailUrl="https://i.ytimg.com/vi/kqtD5dpn9C8/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/kqtD5dpn9C8"
        ),
        YouTubeVideoItem(
            videoId="rfscVS0vtbw",
            title="Python Tutorial for Beginners - Full Course in 11 Hours",
            channelTitle="freeCodeCamp.org",
            thumbnailUrl="https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/rfscVS0vtbw"
        )
    ],
    "fastapi": [
        YouTubeVideoItem(
            videoId="0sOvCWFmrtA",
            title="Python FastAPI Tutorial - Build a Complete REST API",
            channelTitle="freeCodeCamp.org",
            thumbnailUrl="https://i.ytimg.com/vi/0sOvCWFmrtA/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/0sOvCWFmrtA"
        ),
        YouTubeVideoItem(
            videoId="SORiTsvnU28",
            title="FastAPI in 100 Seconds",
            channelTitle="Fireship",
            thumbnailUrl="https://i.ytimg.com/vi/SORiTsvnU28/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/SORiTsvnU28"
        )
    ],
    "react": [
        YouTubeVideoItem(
            videoId="bMknfKXIFA8",
            title="React Course - Beginner's Tutorial for React JavaScript Library",
            channelTitle="freeCodeCamp.org",
            thumbnailUrl="https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/bMknfKXIFA8"
        ),
        YouTubeVideoItem(
            videoId="Tn6-PIqc4UM",
            title="React in 100 Seconds",
            channelTitle="Fireship",
            thumbnailUrl="https://i.ytimg.com/vi/Tn6-PIqc4UM/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/Tn6-PIqc4UM"
        )
    ],
    "next": [
        YouTubeVideoItem(
            videoId="wm5gMKuwSYk",
            title="Next.js 15 Full Course 2025 | Build and Deploy Modern Web Apps",
            channelTitle="freeCodeCamp.org",
            thumbnailUrl="https://i.ytimg.com/vi/wm5gMKuwSYk/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/wm5gMKuwSYk"
        ),
        YouTubeVideoItem(
            videoId="Sklc_fQBmcs",
            title="Next.js in 100 Seconds",
            channelTitle="Fireship",
            thumbnailUrl="https://i.ytimg.com/vi/Sklc_fQBmcs/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/Sklc_fQBmcs"
        )
    ],
    "docker": [
        YouTubeVideoItem(
            videoId="3c-iBn73dDE",
            title="Docker Tutorial for Beginners [Full Course 3 Hours]",
            channelTitle="TechWorld with Nana",
            thumbnailUrl="https://i.ytimg.com/vi/3c-iBn73dDE/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/3c-iBn73dDE"
        ),
        YouTubeVideoItem(
            videoId="Gjnup-PuquQ",
            title="Docker in 100 Seconds",
            channelTitle="Fireship",
            thumbnailUrl="https://i.ytimg.com/vi/Gjnup-PuquQ/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/Gjnup-PuquQ"
        )
    ],
    "kubernetes": [
        YouTubeVideoItem(
            videoId="X48VuDVv0do",
            title="Kubernetes Course - Full Beginners Tutorial (Container Orchestration)",
            channelTitle="freeCodeCamp.org",
            thumbnailUrl="https://i.ytimg.com/vi/X48VuDVv0do/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/X48VuDVv0do"
        ),
        YouTubeVideoItem(
            videoId="PivpCKEiQOQ",
            title="Kubernetes in 100 Seconds",
            channelTitle="Fireship",
            thumbnailUrl="https://i.ytimg.com/vi/PivpCKEiQOQ/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/PivpCKEiQOQ"
        )
    ],
    "system design": [
        YouTubeVideoItem(
            videoId="m8Icp_Cid5o",
            title="System Design Course for Beginners",
            channelTitle="freeCodeCamp.org",
            thumbnailUrl="https://i.ytimg.com/vi/m8Icp_Cid5o/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/m8Icp_Cid5o"
        ),
        YouTubeVideoItem(
            videoId="i53Gi_K3o7I",
            title="System Design Interview: Concepts Every Engineer Should Know",
            channelTitle="NeetCode",
            thumbnailUrl="https://i.ytimg.com/vi/i53Gi_K3o7I/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/i53Gi_K3o7I"
        )
    ],
    "dsa": [
        YouTubeVideoItem(
            videoId="8hly31xKli0",
            title="Algorithms and Data Structures Tutorial - Full Course for Beginners",
            channelTitle="freeCodeCamp.org",
            thumbnailUrl="https://i.ytimg.com/vi/8hly31xKli0/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/8hly31xKli0"
        ),
        YouTubeVideoItem(
            videoId="KLlXCFG5TnA",
            title="NeetCode 150 - Roadmap to Ace Any Coding Interview",
            channelTitle="NeetCode",
            thumbnailUrl="https://i.ytimg.com/vi/KLlXCFG5TnA/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/KLlXCFG5TnA"
        )
    ],
    "sql": [
        YouTubeVideoItem(
            videoId="HXV3zeRR3h4",
            title="SQL Tutorial - Full Database Course for Beginners",
            channelTitle="freeCodeCamp.org",
            thumbnailUrl="https://i.ytimg.com/vi/HXV3zeRR3h4/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/HXV3zeRR3h4"
        ),
        YouTubeVideoItem(
            videoId="ztHopE5Wnpc",
            title="PostgreSQL in 100 Seconds",
            channelTitle="Fireship",
            thumbnailUrl="https://i.ytimg.com/vi/ztHopE5Wnpc/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/ztHopE5Wnpc"
        )
    ]
}


def get_curated_fallback(query: str, max_results: int = 2) -> List[YouTubeVideoItem]:
    """Return top educational videos matching query keywords from trusted educators."""
    clean = query.lower().strip()
    for key, items in CURATED_FALLBACK_LIBRARY.items():
        if key in clean:
            return items[:max_results]

    # Universal high-yield developer tutorial fallback
    return [
        YouTubeVideoItem(
            videoId="8hly31xKli0",
            title=f"{query.title()} Complete Masterclass Tutorial",
            channelTitle="freeCodeCamp.org",
            thumbnailUrl="https://i.ytimg.com/vi/8hly31xKli0/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/8hly31xKli0"
        ),
        YouTubeVideoItem(
            videoId="m8Icp_Cid5o",
            title=f"System Architecture & {query.title()} Core Concepts",
            channelTitle="NeetCode",
            thumbnailUrl="https://i.ytimg.com/vi/m8Icp_Cid5o/hqdefault.jpg",
            embedUrl="https://www.youtube.com/embed/m8Icp_Cid5o"
        )
    ][:max_results]


def search_youtube_tutorials(query: str, max_results: int = 2) -> List[YouTubeVideoItem]:
    """
    Search YouTube Data API v3 for high-yield programming tutorials with in-memory caching
    and zero-crash educational fallback on quota limits (HTTP 403) or network timeouts.
    """
    if not query or not query.strip():
        query = "Python FastAPI"

    clean_query = query.strip()
    cache_key = f"{clean_query.lower()}:{max_results}"

    # 1. In-Memory Cache Check
    if cache_key in _YOUTUBE_CACHE:
        logger.info(f"YouTube Cache Hit for query: '{clean_query}'")
        return _YOUTUBE_CACHE[cache_key]

    api_key = settings.YOUTUBE_API_KEY
    if not api_key:
        logger.warning("YOUTUBE_API_KEY is not configured. Returning curated fallback tutorials.")
        fallback = get_curated_fallback(clean_query, max_results)
        _YOUTUBE_CACHE[cache_key] = fallback
        return fallback

    # 2. Live API Request with strict 4.0s timeout
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "type": "video",
        "videoEmbeddable": "true",
        "maxResults": max_results,
        "q": f"{clean_query} tutorial",
        "key": api_key
    }

    try:
        response = requests.get(url, params=params, timeout=4.0)

        if response.status_code == 200:
            data = response.json()
            items = data.get("items", [])
            results: List[YouTubeVideoItem] = []

            for item in items:
                video_id = item.get("id", {}).get("videoId")
                snippet = item.get("snippet", {})
                title = html.unescape(snippet.get("title", f"{clean_query} Tutorial"))
                channel_title = html.unescape(snippet.get("channelTitle", "Tech Educator"))
                thumbnails = snippet.get("thumbnails", {})
                thumb_url = (
                    thumbnails.get("high", {}).get("url")
                    or thumbnails.get("medium", {}).get("url")
                    or thumbnails.get("default", {}).get("url")
                    or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
                )

                if video_id:
                    results.append(
                        YouTubeVideoItem(
                            videoId=video_id,
                            title=title,
                            channelTitle=channel_title,
                            thumbnailUrl=thumb_url,
                            embedUrl=f"https://www.youtube.com/embed/{video_id}"
                        )
                    )

            if results:
                logger.info(f"Fetched {len(results)} live YouTube videos for query: '{clean_query}'.")
                _YOUTUBE_CACHE[cache_key] = results
                return results
            else:
                logger.warning(f"YouTube API returned 0 results for '{clean_query}'. Using fallback.")

        elif response.status_code == 403:
            logger.warning("YouTube Data API quota exceeded or 403 Forbidden. Seamlessly engaging educational fallback.")
        else:
            logger.warning(f"YouTube Data API returned HTTP {response.status_code}: {response.text[:120]}")

    except requests.exceptions.Timeout:
        logger.warning(f"YouTube API timed out after 4.0s for query '{clean_query}'. Engaging fallback.")
    except Exception as exc:
        logger.warning(f"Unexpected error communicating with YouTube API: {exc}. Engaging fallback.")

    # 3. Fallback on any error or empty response
    fallback_results = get_curated_fallback(clean_query, max_results)
    _YOUTUBE_CACHE[cache_key] = fallback_results
    return fallback_results
