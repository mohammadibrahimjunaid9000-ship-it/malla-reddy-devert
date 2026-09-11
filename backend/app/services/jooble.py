import html
import logging
import re
from typing import List, Optional
import requests

from app.core.config import settings
from app.schemas.jobs import JobPosting

logger = logging.getLogger("skillbridge.services.jooble")


def clean_html(raw_html: str) -> str:
    """Sanitize HTML tags and unescape entities from job description snippets and titles."""
    if not raw_html:
        return ""
    # Strip HTML tags
    clean = re.sub(r"<[^>]+>", "", raw_html)
    # Unescape HTML entities (e.g. &amp;, &nbsp;, &#39;)
    clean = html.unescape(clean)
    # Normalize excessive whitespace
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


INDIAN_CITIES = [
    "india", "bengaluru", "bangalore", "hyderabad", "pune", "delhi",
    "gurgaon", "gurugram", "noida", "chennai", "mumbai", "kolkata",
    "ahmedabad", "remote india", "in"
]


def is_indian_location(location: str) -> bool:
    """Check if the searched location refers to India or Indian tech hubs."""
    if not location:
        return False
    loc_lower = location.strip().lower()
    return any(city in loc_lower for city in INDIAN_CITIES)


def parse_jooble_items(raw_jobs: list, fallback_location: str, default_keywords: str) -> List[JobPosting]:
    """Normalize raw Jooble API items into strict, genuine JobPosting models."""
    results: List[JobPosting] = []
    for idx, item in enumerate(raw_jobs):
        raw_id = item.get("id")
        job_id = str(raw_id) if raw_id is not None else f"jooble-{idx}"
        title = clean_html(item.get("title") or default_keywords)
        company = (item.get("company") or "").strip() or "Hiring Organization"
        raw_loc = (item.get("location") or "").strip()
        location_val = clean_html(raw_loc) if raw_loc else (fallback_location or "Remote")

        snippet_clean = clean_html(item.get("snippet") or "")
        
        # Salary normalization: "Disclosed on Application" if missing or blank
        raw_salary = (item.get("salary") or "").strip()
        salary_val = clean_html(raw_salary) if raw_salary else "Disclosed on Application"

        apply_link = (item.get("link") or "").strip()
        if not apply_link:
            apply_link = f"https://jooble.org/desc/{job_id}"

        results.append(
            JobPosting(
                id=job_id,
                title=title,
                company=company,
                location=location_val,
                snippet=snippet_clean,
                salary=salary_val,
                apply_url=apply_link,
                url=apply_link,
            )
        )
    return results


def search_jooble_jobs(keywords: str = "Software Engineer", location: str = "India") -> List[JobPosting]:
    """
    Query real-time job openings directly from the Jooble REST API.
    Zero synthetic or fake job mock fallbacks:
    - If 0 jobs match or search is too restrictive, returns an empty array [] so UI renders
      an authentic empty state.
    - Preserves raw apply URLs, unescapes snippets, and marks unstated salaries as 'Disclosed on Application'.
    """
    clean_kw = keywords.strip() if keywords and keywords.strip() else "Software Engineer"
    clean_loc = location.strip() if location and location.strip() else ""
    api_key = settings.JOOBLE_API_KEY or ""

    if not api_key:
        logger.warning("JOOBLE_API_KEY is not configured. Returning empty live jobs list.")
        return []

    headers = {"Content-Type": "application/json"}
    payload = {
        "keywords": clean_kw,
        "location": clean_loc
    }

    # Determine primary endpoint domain
    custom_base = (settings.JOOBLE_BASE_URL or "").strip().rstrip("/")
    if custom_base:
        urls_to_try = [f"{custom_base}/api/{api_key}"]
    elif is_indian_location(clean_loc):
        # First attempt domestic Indian endpoint, with international endpoint as backup
        urls_to_try = [
            f"https://in.jooble.org/api/{api_key}",
            f"https://jooble.org/api/{api_key}"
        ]
    else:
        urls_to_try = [f"https://jooble.org/api/{api_key}"]

    for url in urls_to_try:
        try:
            logger.info(f"Querying Jooble REST API: {url} with keywords='{clean_kw}', location='{clean_loc}'")
            response = requests.post(url, headers=headers, json=payload, timeout=4.0)

            if response.status_code == 200:
                data = response.json()
                raw_jobs = data.get("jobs", [])
                
                # If location search returned 0 on international domain for an Indian city,
                # retry with broader country location "India" to fetch genuine live jobs
                if not raw_jobs and is_indian_location(clean_loc) and clean_loc.lower() not in ("india", ""):
                    logger.info(f"0 jobs for '{clean_loc}', retrying Jooble with broader location 'India'")
                    broader_payload = {"keywords": clean_kw, "location": "India"}
                    broad_resp = requests.post(url, headers=headers, json=broader_payload, timeout=4.0)
                    if broad_resp.status_code == 200:
                        raw_jobs = broad_resp.json().get("jobs", [])

                if raw_jobs:
                    results = parse_jooble_items(raw_jobs, clean_loc or "Remote", clean_kw)
                    logger.info(f"Successfully retrieved {len(results)} authentic live vacancies from {url}.")
                    return results
                else:
                    logger.info(f"Jooble API returned 0 matching jobs for '{clean_kw}' in '{clean_loc}'.")
                    return []

            elif response.status_code in (403, 404):
                logger.warning(f"Jooble endpoint {url} returned HTTP {response.status_code}. Attempting next domain if available.")
                continue
            else:
                logger.warning(f"Jooble API error on {url} (HTTP {response.status_code}): {response.text[:100]}")
                continue

        except requests.exceptions.Timeout:
            logger.warning(f"Jooble API timed out after 4.0s on {url}.")
            continue
        except Exception as exc:
            logger.warning(f"Unexpected error communicating with Jooble: {exc}.")
            continue

    # Zero synthetic mock data: Return genuine empty list if no live vacancies could be fetched
    return []
