import logging
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("supabase_client")

supabase: Client | None = None

try:
    if settings.SUPABASE_PROJECT_URL and settings.SUPABASE_SECRET_KEY:
        supabase = create_client(settings.SUPABASE_PROJECT_URL, settings.SUPABASE_SECRET_KEY)
        logger.info("Supabase client successfully initialized.")
    else:
        logger.warning("Supabase URL or Secret Key is not configured in settings.")
except Exception as e:
    logger.error(f"Error initializing Supabase client: {e}")
    supabase = None


def get_supabase_client() -> Client | None:
    """Return the initialized Supabase client."""
    return supabase
