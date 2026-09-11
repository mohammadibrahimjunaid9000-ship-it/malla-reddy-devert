import json
import logging
from pathlib import Path
from typing import List, Optional

from app.schemas.dsa import DSAQuestion

logger = logging.getLogger("skillbridge.services.dsa")

# Locate dsa_bank.json
DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "dsa_bank.json"

_CACHED_DSA_BANK: List[DSAQuestion] = []


def load_dsa_bank() -> List[DSAQuestion]:
    """Load and parse the curated DSA problem bank."""
    global _CACHED_DSA_BANK
    if _CACHED_DSA_BANK:
        return _CACHED_DSA_BANK

    if not DATA_FILE.exists():
        logger.error(f"DSA Bank file not found at {DATA_FILE}")
        return []

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            raw_items = json.load(f)
        _CACHED_DSA_BANK = [DSAQuestion(**item) for item in raw_items]
        logger.info(f"Loaded {len(_CACHED_DSA_BANK)} questions from DSA Bank.")
        return _CACHED_DSA_BANK
    except Exception as e:
        logger.error(f"Failed to load DSA Bank: {e}")
        return []


def get_dsa_questions(company: Optional[str] = None, difficulty: Optional[str] = None) -> List[DSAQuestion]:
    """
    Retrieve curated DSA interview questions, optionally filtered by target company and difficulty.
    Supports case-insensitive matching and 'All' / None wildcards.
    """
    bank = load_dsa_bank()
    results = bank

    if company and company.strip().lower() != "all":
        clean_comp = company.strip().lower()
        results = [q for q in results if q.company.lower() == clean_comp]

    if difficulty and difficulty.strip().lower() != "all":
        clean_diff = difficulty.strip().lower()
        results = [q for q in results if q.difficulty.lower() == clean_diff]

    return results

