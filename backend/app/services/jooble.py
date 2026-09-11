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


INDIAN_CITIES = [
    "india", "bengaluru", "bangalore", "hyderabad", "pune", "delhi",
    "gurgaon", "gurugram", "noida", "chennai", "mumbai", "kolkata",
    "ahmedabad", "remote india", "in"
]


def is_indian_location(location: str) -> bool:
    """Check if the searched location refers to India or major Indian tech hubs."""
    if not location:
        return False
    loc_lower = location.strip().lower()
    return any(city in loc_lower for city in INDIAN_CITIES)


def get_indian_mock_jobs(keywords: str, location: str) -> List[JobPosting]:
    """Generate realistic high-quality Indian domestic tech jobs matching searched keywords."""
    clean_kw = keywords.strip().title() if keywords else "Software Engineer"
    clean_loc = location.strip().title() if location else "Bengaluru, Karnataka"

    return [
        JobPosting(
            id="ind-1",
            title=f"SDE-2 (Backend - {clean_kw})",
            company="Razorpay",
            location="Bengaluru, Karnataka",
            salary="₹18L - ₹28L PA",
            snippet=f"Scale fintech payment processing handling billions of rupees daily. Core microservices require high concurrency, low latency, and deep expertise in {clean_kw}.",
            apply_url="https://razorpay.com/jobs/"
        ),
        JobPosting(
            id="ind-2",
            title=f"Full Stack Engineer ({clean_kw})",
            company="Swiggy",
            location="Bengaluru, Karnataka",
            salary="₹15L - ₹24L PA",
            snippet=f"Architect real-time order matching and consumer application workflows handling peak dinner traffic. Hands-on experience in modern web stacks and {clean_kw}.",
            apply_url="https://careers.swiggy.com/"
        ),
        JobPosting(
            id="ind-3",
            title=f"Software Engineer - Core Platform ({clean_kw})",
            company="PhonePe",
            location="Bengaluru, Karnataka",
            salary="₹16L - ₹26L PA",
            snippet=f"Build resilient distributed transaction ledgers and payment infrastructure. Own mission-critical microservices with focus on reliability and {clean_kw}.",
            apply_url="https://www.phonepe.com/careers/"
        ),
        JobPosting(
            id="ind-4",
            title=f"Frontend Engineer (Next.js / {clean_kw})",
            company="Freshworks",
            location="Hyderabad, Telangana (Hybrid)",
            salary="₹12L - ₹20L PA",
            snippet=f"Craft delightful SaaS user interfaces with exceptional responsiveness and accessible design systems. Deep knowledge of modern frontend architecture and {clean_kw}.",
            apply_url="https://www.freshworks.com/company/careers/"
        ),
        JobPosting(
            id="ind-5",
            title=f"Backend Engineer - Microservices ({clean_kw})",
            company="Zomato",
            location="Gurugram, Haryana",
            salary="₹14L - ₹22L PA",
            snippet=f"Design highly scalable microservices powering live logistics, restaurant discovery, and partner portals across India. Experience with caching and {clean_kw}.",
            apply_url="https://www.zomato.com/careers"
        )
    ]


def get_global_mock_jobs(keywords: str, location: str) -> List[JobPosting]:
    """Generate realistic global tech jobs matching searched keywords."""
    clean_kw = keywords.strip().title() if keywords else "Software Engineer"
    clean_loc = location.strip().title() if location else "Remote"

    return [
        JobPosting(
            id="mock-1",
            title=f"Senior {clean_kw} (Distributed Systems)",
            company="Stripe",
            location=f"{clean_loc} / San Francisco, CA",
            salary="$165,000 - $215,000",
            snippet=f"Scale core transaction processing architecture and lead microservice reliability for high-volume financial infrastructure. Deep expertise in {clean_kw}.",
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
            snippet=f"Build autonomous model evaluation and high-throughput inference runtimes using Python and distributed queues matching {clean_kw} requirements.",
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


def search_jooble_jobs(keywords: str = "Software Engineer", location: str = "Bengaluru, India") -> List[JobPosting]:
    """
    Query real-time job openings with dynamic regional routing and bulletproof fallback.
    - If location is India / domestic tech hub, routes to in.jooble.org.
    - If key domain mismatch (403/404), error, timeout, or 0 jobs returned, seamlessly returns
      the domestic Indian mock dataset.
    - Strict 4.0s timeout ensures the demo never freezes or crashes.
    """
    clean_kw = keywords.strip() if keywords and keywords.strip() else "Software Engineer"
    clean_loc = location.strip() if location and location.strip() else "Bengaluru, India"
    api_key = settings.JOOBLE_API_KEY or ""

    is_india = is_indian_location(clean_loc)
    fallback_fn = get_indian_mock_jobs if is_india else get_global_mock_jobs

    if not api_key:
        logger.warning("JOOBLE_API_KEY not configured. Engaging regional mock fallback.")
        return fallback_fn(clean_kw, clean_loc)

    # Dynamic Regional Endpoint Routing
    endpoint_domain = "in.jooble.org" if is_india else "jooble.org"
    url = f"https://{endpoint_domain}/api/{api_key}"
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
                logger.info(f"Successfully fetched {len(job_results)} live jobs from {endpoint_domain}.")
                return job_results
            else:
                logger.info(f"{endpoint_domain} returned 0 jobs for '{clean_kw}' in '{clean_loc}'. Engaging fallback.")
        elif response.status_code in (403, 404):
            logger.warning(f"Jooble key domain mismatch on {endpoint_domain} (HTTP {response.status_code}). Engaging regional fallback.")
        elif response.status_code == 429:
            logger.warning("Jooble API rate limit reached (HTTP 429). Engaging fallback.")
        else:
            logger.warning(f"Jooble API returned non-200 status {response.status_code}: {response.text[:120]}")

    except requests.exceptions.Timeout:
        logger.warning(f"Jooble API request timed out after 4.0s on {endpoint_domain}. Engaging fallback.")
    except Exception as exc:
        logger.warning(f"Unexpected error communicating with Jooble: {exc}. Engaging fallback.")

    return fallback_fn(clean_kw, clean_loc)

