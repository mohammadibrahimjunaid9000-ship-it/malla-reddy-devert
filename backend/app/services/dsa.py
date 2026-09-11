import json
import logging
from pathlib import Path
from typing import List, Optional, Set

from app.schemas.dsa import DSAQuestion

logger = logging.getLogger("skillbridge.services.dsa")

# Locate primary consolidated questions file and legacy fallback
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PRIMARY_DATA_FILE = DATA_DIR / "dsa_questions.json"
LEGACY_DATA_FILE = DATA_DIR / "dsa_bank.json"

_CACHED_DSA_QUESTIONS: List[DSAQuestion] = []
_CACHED_COMPANIES: List[str] = []

# Quick Filter Preset Categories
FAANG_COMPANIES: Set[str] = {
    "google", "amazon", "meta", "apple", "netflix", "microsoft"
}
INDIAN_UNICORNS: Set[str] = {
    "flipkart", "swiggy", "zomato", "phonepe", "razorpay", "paytm",
    "zepto", "makemytrip", "juspay", "darwinbox", "ola cabs", "zoho",
    "delhivery", "inmobi", "cred", "meesho", "swiggy"
}
FINTECH_COMPANIES: Set[str] = {
    "stripe", "citadel", "jane street", "goldman sachs", "morgan stanley",
    "robinhood", "paypal", "visa", "mastercard", "squarepoint capital",
    "two sigma", "blackrock", "capital one", "jpmorgan", "barclays"
}


def load_dsa_dataset() -> List[DSAQuestion]:
    """Load and parse the consolidated 3,300+ LeetCode DSA problem bank."""
    global _CACHED_DSA_QUESTIONS, _CACHED_COMPANIES
    if _CACHED_DSA_QUESTIONS:
        return _CACHED_DSA_QUESTIONS

    target_file = PRIMARY_DATA_FILE if PRIMARY_DATA_FILE.exists() else LEGACY_DATA_FILE
    if not target_file.exists():
        logger.error(f"DSA Bank file not found at {PRIMARY_DATA_FILE} or {LEGACY_DATA_FILE}")
        return []

    try:
        with open(target_file, "r", encoding="utf-8") as f:
            raw_items = json.load(f)

        parsed: List[DSAQuestion] = []
        unique_companies: Set[str] = set()

        for item in raw_items:
            # Handle legacy format where company is string
            if "company" in item and "companies" not in item:
                item["companies"] = [item["company"]]

            q = DSAQuestion(**item)
            parsed.append(q)
            for c in q.companies:
                unique_companies.add(c)

        _CACHED_DSA_QUESTIONS = parsed
        _CACHED_COMPANIES = sorted(list(unique_companies))
        logger.info(f"Loaded {len(_CACHED_DSA_QUESTIONS)} LeetCode questions across {len(_CACHED_COMPANIES)} companies.")
        return _CACHED_DSA_QUESTIONS
    except Exception as e:
        logger.error(f"Failed to load DSA dataset: {e}")
        return []


def get_all_companies() -> List[str]:
    """Retrieve sorted list of all unique company names across the dataset."""
    global _CACHED_COMPANIES
    if not _CACHED_COMPANIES:
        load_dsa_dataset()
    return _CACHED_COMPANIES


def get_dsa_questions(
    company: Optional[str] = None,
    difficulty: Optional[str] = None,
    topic: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 50
) -> List[DSAQuestion]:
    """
    Retrieve consolidated company DSA interview questions with filtering and pagination.
    Supports company categories: 'FAANG / Big Tech', 'Indian Unicorns', 'Fintech'.
    """
    dataset = load_dsa_dataset()
    results = dataset

    # 1. Company / Preset Category Filter
    if company and company.strip() and company.strip().lower() != "all":
        comp_clean = company.strip().lower()
        if comp_clean in ("faang", "faang / big tech", "big tech"):
            results = [
                q for q in results
                if any(c.lower() in FAANG_COMPANIES for c in q.companies)
            ]
        elif comp_clean in ("indian unicorns", "indian unicorn", "india tech"):
            results = [
                q for q in results
                if any(c.lower() in INDIAN_UNICORNS for c in q.companies)
            ]
        elif comp_clean in ("fintech", "finance & trading"):
            results = [
                q for q in results
                if any(c.lower() in FINTECH_COMPANIES for c in q.companies)
            ]
        else:
            results = [
                q for q in results
                if any(comp_clean == c.lower() or comp_clean in c.lower() for c in q.companies)
            ]

    # 2. Difficulty Filter
    if difficulty and difficulty.strip() and difficulty.strip().lower() != "all":
        diff_clean = difficulty.strip().lower()
        results = [q for q in results if q.difficulty.lower() == diff_clean]

    # 3. Topic Filter
    if topic and topic.strip() and topic.strip().lower() != "all":
        topic_clean = topic.strip().lower()
        results = [q for q in results if topic_clean in (q.topic or "").lower() or topic_clean in (q.pattern or "").lower()]

    # 4. Search Query Filter (Title or Topic)
    if search and search.strip():
        q_clean = search.strip().lower()
        results = [
            q for q in results
            if q_clean in q.title.lower() or q_clean in (q.topic or "").lower()
        ]

    # 5. Pagination
    safe_page = max(1, page)
    safe_limit = max(1, min(limit, 200))
    start = (safe_page - 1) * safe_limit
    end = start + safe_limit

    return results[start:end]
