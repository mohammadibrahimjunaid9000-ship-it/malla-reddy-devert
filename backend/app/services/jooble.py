import html
import logging
import re
from typing import List
import requests

from app.core.config import settings
from app.schemas.jobs import JobPosting

logger = logging.getLogger("skillbridge.services.jooble")


def clean_html(raw_html: str) -> str:
    """Sanitize HTML tags and unescape entities from job description snippets."""
    if not raw_html:
        return ""
    # Strip HTML tags
    clean = re.sub(r"<[^>]+>", "", raw_html)
    # Unescape HTML entities (e.g. &amp;, &nbsp;, &#39;)
    clean = html.unescape(clean)
    # Normalize whitespace
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def get_mock_fallback_jobs(keywords: str, location: str) -> List[JobPosting]:
    """Generate realistic high-quality mock tech jobs matching the searched keywords."""
    clean_kw = keywords.strip().title() if keywords else "Software Engineer"
    clean_loc = location.strip().title() if location else "Remote"

    return [
        JobPosting(
            id="mock-1",
            title=f"Senior {clean_kw} (Distributed Systems)",
            company="Stripe",
            location=f"{clean_loc} / San Francisco, CA",
            salary="$165,000 - $215,000",
            snippet=f"Scale core transaction processing architecture and lead microservice reliability for high-volume financial infrastructure. Requires deep expertise in {clean_kw}.",
            apply_url="https://stripe.com/jobs"
        ),
        JobPosting(
            id="mock-2",
            title=f"Staff {clean_kw} (Platform Architecture)",
            company="Datadog",
            location=f"{clean_loc} / New York, NY",
            salary="$175,000 - $225,000",
            snippet=f"Design multi-tenant cloud systems and observability pipelines. Drive technical excellence and mentor engineering pods on {clean_kw} best practices.",
            apply_url="https://www.datadoghq.com/careers/"
        ),
        JobPosting(
            id="mock-3",
            title=f"AI Systems & {clean_kw}",
            company="Scale AI",
            location=f"{clean_loc} / Seattle, WA",
            salary="$180,000 - $240,000",
            snippet=f"Build autonomous model evaluation and high-throughput inference runtimes using Python, PyTorch, and distributed queues matching {clean_kw} requirements.",
            apply_url="https://scale.com/careers"
        ),
        JobPosting(
            id="mock-4",
            title=f"Full Stack {clean_kw}",
            company="Vercel",
            location=f"{clean_loc} (Worldwide)",
            salary="$160,000 - $205,000",
            snippet=f"Develop cutting-edge developer tooling and edge compute workflows around modern cloud frameworks. High impact role for an experienced {clean_kw}.",
            apply_url="https://vercel.com/careers"
        )
    ]


def search_jooble_jobs(keywords: str = "Software Engineer", location: str = "Remote") -> List[JobPosting]:
    """
    Query real-time job openings from Jooble API with a strict 4.0s timeout.
    Falls back gracefully to realistic mock tech jobs on network timeout, 429 rate limit, or error.
    """
    clean_kw = keywords.strip() if keywords and keywords.strip() else "Software Engineer"
    clean_loc = location.strip() if location and location.strip() else "Remote"
    api_key = settings.JOOBLE_API_KEY or ""

    if not api_key:
        logger.warning("JOOBLE_API_KEY not configured. Using realistic mock fallback.")
        return get_mock_fallback_jobs(clean_kw, clean_loc)

    url = f"https://jooble.org/api/{api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "keywords": clean_kw,
        "location": clean_loc
    }

    try:
        # Strict 4.0-second timeout as required by defensive design rules
        response = requests.post(url, headers=headers, json=payload, timeout=4.0)

        if response.status_code == 200:
            data = response.json()
            raw_jobs = data.get("jobs", [])
            if raw_jobs:
                job_results: List[JobPosting] = []
                for idx, item in enumerate(raw_jobs[:12]):
                    raw_snippet = item.get("snippet", "")
                    job_results.append(
                        JobPosting(
                            id=f"jooble-{item.get('id', idx)}",
                            title=item.get("title", clean_kw),
                            company=item.get("company") or "Technology Organization",
                            location=item.get("location") or clean_loc,
                            snippet=clean_html(raw_snippet) or f"Active opportunity for {clean_kw}.",
                            salary=item.get("salary") or "Not specified",
                            apply_url=item.get("link") or "https://jooble.org",
                        )
                    )
                logger.info(f"Successfully fetched {len(job_results)} live jobs from Jooble.")
                return job_results
        elif response.status_code == 429:
            logger.warning("Jooble API rate limit reached (HTTP 429). Engaging fallback.")
        else:
            logger.warning(f"Jooble API returned non-200 status {response.status_code}: {response.text[:120]}")

    except requests.exceptions.Timeout:
        logger.warning("Jooble API request timed out after 4.0s. Engaging fallback.")
    except Exception as exc:
        logger.warning(f"Unexpected error communicating with Jooble: {exc}. Engaging fallback.")

    return get_mock_fallback_jobs(clean_kw, clean_loc)
