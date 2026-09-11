#!/usr/bin/env python3
"""
One-time ingestion and consolidation script for company-wise LeetCode problems.
Clones https://github.com/liquidslr/leetcode-company-wise-problems.git into a tempdir,
parses CSVs across 400+ companies, deduplicates problems, and generates a unified
dsa_questions.json with company tags and topics.
"""

import csv
import json
import logging
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ingest_dsa")

REPO_URL = "https://github.com/liquidslr/leetcode-company-wise-problems.git"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "app" / "data"
OUTPUT_FILE = OUTPUT_DIR / "dsa_questions.json"


def normalize_company_name(name: str) -> str:
    """Standardize company names (capitalize common acronyms, clean casing)."""
    clean = name.strip()
    special_cases = {
        "tcs": "TCS",
        "jio": "Jio",
        "razorpay": "Razorpay",
        "ciena": "Ciena",
        "persistent systems": "Persistent Systems",
        "athenahealth": "Athenahealth",
        "smartnews": "SmartNews",
        "ebay": "eBay",
    }
    if clean.lower() in special_cases:
        return special_cases[clean.lower()]
    return clean


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    temp_dir = tempfile.mkdtemp(prefix="leetcode_dsa_")
    logger.info(f"Cloning {REPO_URL} into temporary directory: {temp_dir}...")

    try:
        cmd = ["git", "clone", "--depth", "1", REPO_URL, temp_dir]
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logger.info("Clone completed successfully. Starting parsing and consolidation...")

        clone_path = Path(temp_dir)
        company_dirs = [p for p in clone_path.iterdir() if p.is_dir() and not p.name.startswith(".")]
        logger.info(f"Found {len(company_dirs)} company folders.")

        problems_by_url: dict[str, dict] = {}
        all_companies: set[str] = set()

        for comp_dir in company_dirs:
            raw_company = comp_dir.name
            company_name = normalize_company_name(raw_company)
            all_companies.add(company_name)

            for csv_file in comp_dir.glob("*.csv"):
                try:
                    with open(csv_file, "r", encoding="utf-8", errors="ignore") as fp:
                        reader = csv.DictReader(fp)
                        for row in reader:
                            title = (row.get("Title") or "").strip()
                            raw_link = (row.get("Link") or "").strip()
                            if not title or not raw_link:
                                continue

                            # Normalize URL
                            clean_url = raw_link.rstrip("/")
                            if not clean_url.endswith("/"):
                                clean_url = clean_url + "/"

                            raw_diff = (row.get("Difficulty") or "Medium").strip().capitalize()
                            if raw_diff not in ("Easy", "Medium", "Hard"):
                                raw_diff = "Medium"

                            raw_topic = (row.get("Topics") or "Algorithms").strip()
                            if not raw_topic:
                                raw_topic = "Algorithms"

                            if clean_url not in problems_by_url:
                                problems_by_url[clean_url] = {
                                    "title": title,
                                    "difficulty": raw_diff,
                                    "topic": raw_topic,
                                    "leetcode_url": clean_url,
                                    "companies": set(),
                                }

                            problems_by_url[clean_url]["companies"].add(company_name)
                except Exception as file_err:
                    logger.warning(f"Error parsing {csv_file}: {file_err}")

        logger.info(f"Consolidated {len(problems_by_url)} unique LeetCode problems across {len(all_companies)} companies.")

        # Sort problems by company count (highest popularity first)
        sorted_problems = sorted(
            problems_by_url.values(),
            key=lambda x: (-len(x["companies"]), x["title"])
        )

        final_dataset = []
        for idx, item in enumerate(sorted_problems, 1):
            final_dataset.append({
                "id": idx,
                "title": item["title"],
                "difficulty": item["difficulty"],
                "topic": item["topic"],
                "leetcode_url": item["leetcode_url"],
                "companies": sorted(list(item["companies"])),
            })

        logger.info(f"Writing dataset to {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
            json.dump(final_dataset, out, indent=2, ensure_ascii=False)

        file_size_mb = OUTPUT_FILE.stat().st_size / (1024 * 1024)
        logger.info(f"SUCCESS! Saved {len(final_dataset)} questions to {OUTPUT_FILE} ({file_size_mb:.2f} MB).")

    finally:
        logger.info(f"Cleaning up temporary directory: {temp_dir}...")
        shutil.rmtree(temp_dir, ignore_errors=True)
        logger.info("Cleanup complete.")


if __name__ == "__main__":
    main()
