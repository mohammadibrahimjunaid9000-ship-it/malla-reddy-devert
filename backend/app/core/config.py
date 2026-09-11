import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Locate backend root and .env file
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"

def load_env_with_fallbacks() -> dict:
    """
    Parse .env file supporting exact and irregular variable names/typos
    (e.g., 'supabse _secret_key', 'supabase_secret_key', 'supabase_Publishable_key').
    """
    env_data: dict[str, str] = {}
    
    # 1. System environment variables
    for k, v in os.environ.items():
        env_data[k] = v

    # 2. Robust file parsing that handles whitespace in keys and comments
    if ENV_FILE.exists():
        try:
            with open(ENV_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        key, val = line.split("=", 1)
                        k_clean = key.strip()
                        v_clean = val.strip().strip("'\"")
                        env_data[k_clean] = v_clean
                        
                        # Populate os.environ so standard libraries also see them
                        os.environ.setdefault(k_clean, v_clean)
                        
                        # Normalize key name for fallback matching
                        normalized = k_clean.lower().replace(" ", "").replace("_", "")
                        if "projecturl" in normalized or normalized == "supabaseurl":
                            env_data.setdefault("SUPABASE_PROJECT_URL", v_clean)
                            env_data.setdefault("supabase_project_url", v_clean)
                            os.environ.setdefault("SUPABASE_PROJECT_URL", v_clean)
                        elif "secretkey" in normalized:
                            env_data.setdefault("SUPABASE_SECRET_KEY", v_clean)
                            env_data.setdefault("supabase_secret_key", v_clean)
                            os.environ.setdefault("SUPABASE_SECRET_KEY", v_clean)
                        elif "publishablekey" in normalized or "anonkey" in normalized:
                            env_data.setdefault("SUPABASE_PUBLISHABLE_KEY", v_clean)
                            env_data.setdefault("supabase_publishable_key", v_clean)
                            os.environ.setdefault("SUPABASE_PUBLISHABLE_KEY", v_clean)
        except Exception:
            pass

    return env_data

raw_env = load_env_with_fallbacks()

class Settings(BaseSettings):
    SUPABASE_PROJECT_URL: str = (
        raw_env.get("SUPABASE_PROJECT_URL")
        or raw_env.get("supabase_project_url")
        or raw_env.get("SUPABASE_URL")
        or ""
    )
    SUPABASE_SECRET_KEY: str = (
        raw_env.get("SUPABASE_SECRET_KEY")
        or raw_env.get("supabase_secret_key")
        or raw_env.get("supabse _secret_key")
        or raw_env.get("SUPABASE_KEY")
        or ""
    )
    SUPABASE_PUBLISHABLE_KEY: str = (
        raw_env.get("SUPABASE_PUBLISHABLE_KEY")
        or raw_env.get("supabase_publishable_key")
        or raw_env.get("supabase_Publishable_key")
        or ""
    )
    GEMINI_API_KEY: str = (
        raw_env.get("GEMINI_API_KEY")
        or raw_env.get("GEMINI")
        or raw_env.get("gemini")
        or ""
    )
    JOOBLE_API_KEY: str = (
        raw_env.get("JOOBLE_API_KEY")
        or raw_env.get("jooble_api")
        or raw_env.get("jooble_api_key")
        or ""
    )
    JOOBLE_BASE_URL: str = (
        raw_env.get("JOOBLE_BASE_URL")
        or raw_env.get("jooble_base_url")
        or ""
    )
    YOUTUBE_API_KEY: str = (
        raw_env.get("YOUTUBE_API_KEY")
        or raw_env.get("youtube_api")
        or raw_env.get("youtube_api_key")
        or ""
    )
    PORT: int = int(raw_env.get("PORT", 8000))

    # Compatibility aliases
    @property
    def supabase_project_url(self) -> str:
        return self.SUPABASE_PROJECT_URL

    @property
    def supabase_secret_key(self) -> str:
        return self.SUPABASE_SECRET_KEY

    @property
    def supabase_publishable_key(self) -> str:
        return self.SUPABASE_PUBLISHABLE_KEY

settings = Settings()
