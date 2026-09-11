import logging
from fastapi import APIRouter, HTTPException, Path

from app.schemas.analysis import GapAnalysisResponse
from app.schemas.storage import AnalysisSaveRequest, AnalysisSaveResponse
from app.services.storage import get_saved_analysis_record, save_analysis_record

logger = logging.getLogger("skillbridge.api.analyses")

router = APIRouter(prefix="/analyses", tags=["Analyses"])


@router.post(
    "",
    response_model=AnalysisSaveResponse,
    summary="Save Analysis & Generate Shareable Link",
    description="Persist candidate gap analysis payload into Supabase with automatic local fallback."
)
def save_analysis(payload: AnalysisSaveRequest) -> AnalysisSaveResponse:
    try:
        return save_analysis_record(payload)
    except Exception as e:
        logger.error(f"Error saving analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to persist analysis: {str(e)}")


@router.get(
    "/{analysis_id}",
    response_model=GapAnalysisResponse,
    summary="Fetch Saved Analysis by ID",
    description="Retrieve a previously saved analysis for public shareable roadmap viewing."
)
def get_analysis(
    analysis_id: str = Path(..., description="UUID of the stored analysis record")
) -> GapAnalysisResponse:
    analysis = get_saved_analysis_record(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found or link has expired.")
    return analysis
