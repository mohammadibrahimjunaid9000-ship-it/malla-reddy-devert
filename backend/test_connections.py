"""
Standalone connection verification script for SkillBridge backend.
Tests Gemini API, Supabase Database, and Jooble Job Search API connectivity.
"""
import sys
from pathlib import Path
import requests

# Add backend directory to sys.path so app modules resolve cleanly
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import settings
from app.core.supabase import supabase


def print_banner(title: str):
    print("=" * 60, flush=True)
    print(f"  {title}", flush=True)
    print("=" * 60, flush=True)


def test_supabase_connection() -> bool:
    print("\n[CHECK 1/3] Testing Supabase Connectivity & Schema...", flush=True)
    url = settings.SUPABASE_PROJECT_URL
    key = settings.SUPABASE_SECRET_KEY

    if not url:
        print("  [FAIL] Missing SUPABASE_PROJECT_URL in backend/.env", flush=True)
        return False
    if not key:
        print("  [FAIL] Missing SUPABASE_SECRET_KEY in backend/.env", flush=True)
        return False

    masked_key = f"{key[:6]}...{key[-4:]}" if len(key) > 10 else "***"
    print(f"  Target URL : {url}", flush=True)
    print(f"  Secret Key : {masked_key}", flush=True)

    try:
        if not supabase:
            print("  [FAIL] Supabase client was not initialized properly.", flush=True)
            return False

        res = supabase.table("analyses").select("id").limit(1).execute()
        count = len(res.data) if res.data is not None else 0
        print(f"  [PASS] Successfully queried 'analyses' table! (Records found: {count})", flush=True)
        return True
    except Exception as exc:
        err_msg = str(exc)
        if "PGRST205" in err_msg:
            print("  [FAIL] Schema Error: Table 'public.analyses' does not exist.", flush=True)
        elif "Invalid API key" in err_msg or "JWT" in err_msg:
            print("  [FAIL] Authentication Error: SUPABASE_SECRET_KEY is invalid or rejected.", flush=True)
        else:
            print(f"  [FAIL] Supabase Query Error: {err_msg}", flush=True)
        return False


def test_gemini_connection() -> bool:
    print("\n[CHECK 2/3] Testing Gemini API Connectivity...", flush=True)
    api_key = settings.GEMINI_API_KEY

    if not api_key:
        print("  [FAIL] Missing GEMINI_API_KEY in backend/.env", flush=True)
        return False

    masked_key = f"{api_key[:6]}...{api_key[-4:]}" if len(api_key) > 10 else "***"
    print(f"  API Key    : {masked_key}", flush=True)

    from google import genai
    client = genai.Client(api_key=api_key)

    models_to_test = [
        "gemini-3.6-flash",
        "gemini-2.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-1.5-flash",
        "gemini-flash-latest"
    ]

    for model_name in models_to_test:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents="Say pong in one word"
            )
            reply = (response.text or "").strip()
            print(f"  Model Tested: {model_name}", flush=True)
            print(f"  Response    : \"{reply}\"", flush=True)
            print(f"  [PASS] Gemini API connection confirmed active and responding via '{model_name}'!", flush=True)
            return True
        except Exception as exc:
            err_str = str(exc)
            if "not found" in err_str.lower() or "no longer available" in err_str.lower() or "503" in err_str:
                continue
            elif "API_KEY_INVALID" in err_str or ("400" in err_str and "API key" in err_str):
                print(f"  [FAIL] Gemini API Key Invalid: {err_str}", flush=True)
                return False
            elif "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
                print(f"  [FAIL] Rate Limit Exceeded (429): {err_str}", flush=True)
                return False
            else:
                continue

    print("  [FAIL] Could not invoke tested Gemini models.", flush=True)
    return False


def test_jooble_connection() -> bool:
    print("\n[CHECK 3/3] Testing Jooble Job Search API Connectivity...", flush=True)
    api_key = settings.JOOBLE_API_KEY

    if not api_key:
        print("  [FAIL] Missing JOOBLE_API_KEY in backend/.env", flush=True)
        return False

    masked_key = f"{api_key[:6]}...{api_key[-4:]}" if len(api_key) > 10 else "***"
    print(f"  Jooble Key : {masked_key}", flush=True)

    try:
        url = f"https://jooble.org/api/{api_key}"
        payload = {"keywords": "Python Developer", "location": "Remote"}
        res = requests.post(url, json=payload, timeout=6)

        if res.status_code == 200:
            data = res.json()
            jobs = data.get("jobs", [])
            print(f"  [PASS] Jooble API active! Received {len(jobs)} live job openings.", flush=True)
            if jobs:
                first = jobs[0]
                print(f"         Sample Job: \"{first.get('title')}\" at {first.get('company')}", flush=True)
            return True
        else:
            print(f"  [FAIL] Jooble HTTP Error: {res.status_code} - {res.text[:120]}", flush=True)
            return False
    except Exception as exc:
        print(f"  [FAIL] Jooble Connection Error: {exc}", flush=True)
        return False


def main():
    print_banner("SkillBridge External Connections Diagnostics")

    supabase_ok = test_supabase_connection()
    gemini_ok = test_gemini_connection()
    jooble_ok = test_jooble_connection()

    print("\n" + "=" * 60, flush=True)
    print("  DIAGNOSTIC SUMMARY:", flush=True)
    print(f"  - Supabase Database : {'[PASS]' if supabase_ok else '[FAIL]'}", flush=True)
    print(f"  - Gemini AI Engine  : {'[PASS]' if gemini_ok else '[FAIL]'}", flush=True)
    print(f"  - Jooble Job Board  : {'[PASS]' if jooble_ok else '[FAIL]'}", flush=True)
    print("=" * 60, flush=True)

    if not (supabase_ok and gemini_ok and jooble_ok):
        sys.exit(1)
    else:
        print("\nAll 3 external services verified successfully! Full stack ready.\n", flush=True)
        sys.exit(0)


if __name__ == "__main__":
    main()
