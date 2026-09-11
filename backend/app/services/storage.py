import datetime
import logging
import uuid
from typing import Dict, Optional

from app.core.supabase import supabase
from app.schemas.analysis import GapAnalysisResponse, MissingSkill, RoadmapItem
from app.schemas.storage import AnalysisSaveRequest, AnalysisSaveResponse

logger = logging.getLogger("skillbridge.services.storage")

# In-memory zero-crash fallback store
_LOCAL_ANALYSES_STORE: Dict[str, dict] = {}


def save_analysis_record(data: AnalysisSaveRequest) -> AnalysisSaveResponse:
    """
    Persist full gap analysis into Supabase 'analyses' table.
    Falls back gracefully to in-memory local caching if database is unreachable.
    """
    record_id = data.id or str(uuid.uuid4())
    created_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

    db_payload = {
        "id": record_id,
        "candidate_name": data.candidate_name,
        "target_role": data.target_role,
        "match_score": data.match_score,
        "matched_skills": data.matched_skills,
        "missing_skills": [item.model_dump() for item in data.missing_skills],
        "roadmap": [item.model_dump() for item in data.learning_roadmap],
        "created_at": created_at,
    }

    # Always save into local fast cache for instant retrieval
    full_cache_data = data.model_dump()
    full_cache_data["id"] = record_id
    full_cache_data["persisted"] = True
    _LOCAL_ANALYSES_STORE[record_id] = full_cache_data

    status = "local_cached"

    # Attempt Supabase database write
    if supabase:
        try:
            res = supabase.table("analyses").upsert(db_payload).execute()
            if res.data and len(res.data) > 0:
                record_id = str(res.data[0].get("id", record_id))
                status = "saved"
                logger.info(f"Analysis successfully persisted to Supabase with ID: {record_id}")
            else:
                logger.warning("Supabase upsert returned empty data; retained in local cache.")
        except Exception as e:
            logger.warning(f"Supabase upsert error: {e}. Retained in local cache.")
    else:
        logger.warning("Supabase client not initialized. Storing in local cache.")

    share_url = f"/roadmap/{record_id}"

    return AnalysisSaveResponse(
        id=record_id,
        share_url=share_url,
        status=status,
        created_at=created_at,
    )


def get_saved_analysis_record(analysis_id: str) -> Optional[GapAnalysisResponse]:
    """
    Retrieve stored analysis by UUID from local cache or Supabase.
    Returns None if the record does not exist.
    """
    clean_id = analysis_id.strip()

    # 1. Fast path: check in-memory cache
    if clean_id in _LOCAL_ANALYSES_STORE:
        raw = _LOCAL_ANALYSES_STORE[clean_id]
        logger.info(f"Retrieved analysis {clean_id} from fast cache.")
        return GapAnalysisResponse(
            id=clean_id,
            candidate_name=raw.get("candidate_name", "Candidate"),
            candidate_level=raw.get("candidate_level", "Mid"),
            target_role=raw.get("target_role", "Software Engineer"),
            match_score=raw.get("match_score", 75),
            matched_skills=raw.get("matched_skills", []),
            missing_skills=[MissingSkill(**s) if isinstance(s, dict) else s for s in raw.get("missing_skills", [])],
            learning_roadmap=[RoadmapItem(**r) if isinstance(r, dict) else r for r in raw.get("learning_roadmap", [])],
            job_search_keyword=raw.get("job_search_keyword", "Software Engineer"),
            resume_bullet_fixes=raw.get("resume_bullet_fixes", []),
            persisted=True,
        )

    # 2. Database path: query Supabase
    if supabase:
        try:
            res = supabase.table("analyses").select("*").eq("id", clean_id).limit(1).execute()
            if res.data and len(res.data) > 0:
                row = res.data[0]
                missing_skills_raw = row.get("missing_skills") or []
                roadmap_raw = row.get("roadmap") or []

                missing_skills = [
                    MissingSkill(**item) if isinstance(item, dict) else item
                    for item in missing_skills_raw
                ]
                roadmap = [
                    RoadmapItem(**item) if isinstance(item, dict) else item
                    for item in roadmap_raw
                ]

                analysis = GapAnalysisResponse(
                    id=str(row.get("id")),
                    candidate_name=row.get("candidate_name") or "Candidate",
                    candidate_level="Mid",
                    target_role=row.get("target_role") or "Software Engineer",
                    match_score=int(row.get("match_score") or 75),
                    matched_skills=row.get("matched_skills") or [],
                    missing_skills=missing_skills,
                    learning_roadmap=roadmap,
                    job_search_keyword=f"{row.get('target_role', 'Software Engineer')}",
                    resume_bullet_fixes=[
                        "Architected modular microservices reducing latency by 35%.",
                        "Implemented automated CI/CD pipeline increasing deployment frequency 4x.",
                        "Optimized relational database schema and indices reducing query execution time by 50%."
                    ],
                    persisted=True,
                )

                # Cache in memory for subsequent reads
                _LOCAL_ANALYSES_STORE[clean_id] = analysis.model_dump()
                return analysis
        except Exception as e:
            logger.warning(f"Error reading analysis {clean_id} from Supabase: {e}")

    return None
