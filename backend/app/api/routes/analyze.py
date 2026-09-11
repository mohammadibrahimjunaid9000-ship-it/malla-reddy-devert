import logging
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile, status

from app.core.supabase import supabase
from app.schemas.analysis import GapAnalysisResponse, MissingSkill, RoadmapItem
from app.services.analyzer import analyze_resume_with_gemini
from app.services.extractor import extract_text_from_pdf

logger = logging.getLogger("skillbridge.routes.analyze")

router = APIRouter(tags=["Skill Gap Analysis"])


@router.get(
    "/demo-analysis",
    response_model=GapAnalysisResponse,
    summary="Instant Hackathon Pitch Demo Analysis",
    description="Returns an instant, rich structured gap analysis payload with 0 latency for pitching and demos."
)
def get_demo_analysis() -> GapAnalysisResponse:
    """Pre-computed high quality analysis for zero-latency live demonstrations."""
    return GapAnalysisResponse(
        id="demo-77f28a9b-4e12-4c2f-b883-9118dce852f1",
        candidate_name="Alex Rivera",
        candidate_level="Mid",
        target_role="Senior AI Systems Engineer",
        match_score=82,
        matched_skills=[
            "Python 3.12+",
            "FastAPI / Uvicorn",
            "TypeScript & Next.js App Router",
            "Vector Embeddings & RAG Pipelines",
            "PostgreSQL & Supabase",
            "Docker & Microservices"
        ],
        missing_skills=[
            MissingSkill(
                skill="vLLM & TensorRT-LLM Inference Optimization",
                importance="High",
                reason="Required for high-throughput, low-latency model serving in production AI systems."
            ),
            MissingSkill(
                skill="Kubernetes & Ray Cluster Autoscaling",
                importance="High",
                reason="Needed to manage distributed worker pools for fine-tuning and GPU batch tasks."
            ),
            MissingSkill(
                skill="LangSmith / Phoenix AI Observability",
                importance="Medium",
                reason="Crucial for tracing agentic multi-hop LLM tool calls and token cost metrics."
            )
        ],
        learning_roadmap=[
            RoadmapItem(
                week=1,
                theme="High-Throughput LLM Serving Engines",
                task="Deploy an open-source model using vLLM with PagedAttention and benchmark requests/sec.",
                youtube_search_query="vLLM production deployment paged attention tutorial",
                coursera_search_query="Generative AI with Large Language Models"
            ),
            RoadmapItem(
                week=2,
                theme="Distributed AI Inference & Ray Clusters",
                task="Set up a local Ray cluster to orchestrate parallel model batch evaluations.",
                youtube_search_query="Ray core and Ray serve distributed python tutorial",
                coursera_search_query="Distributed Computing with Ray"
            ),
            RoadmapItem(
                week=3,
                theme="Production RAG Guardrails & Evaluation",
                task="Implement automated RAG evaluation using Ragas framework to grade context relevancy.",
                youtube_search_query="RAG evaluation with Ragas and Langfuse",
                coursera_search_query="Building LLM Applications with LangChain"
            ),
            RoadmapItem(
                week=4,
                theme="End-to-End Autonomous Agent Capstone",
                task="Construct a full agentic pipeline with automated fallback routing and OpenTelemetry tracing.",
                youtube_search_query="Building autonomous AI agents production patterns",
                coursera_search_query="Machine Learning Specialization DeepLearning.AI"
            )
        ],
        job_search_keyword="Senior AI Engineer LLM FastAPI Python",
        resume_bullet_fixes=[
            "Architected an enterprise RAG query pipeline using FastAPI and vector embeddings, reducing search retrieval latency by 45% for 120,000 monthly queries.",
            "Containerized and deployed 8 microservices using Docker and GitHub Actions, achieving 99.95% uptime and automated rollback on failure.",
            "Engineered semantic caching layer with Redis, reducing Gemini API token expenditure by $2,400 monthly."
        ],
        persisted=True
    )


@router.post(
    "/analyze",
    response_model=GapAnalysisResponse,
    summary="Analyze Resume Against Target Role",
    description="Upload a PDF resume or provide raw text along with a target job title. Analyzes skill gaps via Gemini 1.5 Flash and persists to Supabase."
)
async def analyze_resume(
    request: Request,
    target_role: Optional[str] = Form(None, description="The job title to evaluate against (e.g. 'Backend Engineer')"),
    resume_file: Optional[UploadFile] = File(None, description="PDF resume file"),
    raw_resume_text: Optional[str] = Form(None, description="Raw pasted resume text as an alternative to PDF")
) -> GapAnalysisResponse:
    final_role = target_role or ""
    final_text = ""

    # Support application/json requests in addition to multipart/form-data
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            json_body = await request.json()
            final_role = json_body.get("target_role", "")
            final_text = json_body.get("raw_resume_text", "")
        except Exception:
            pass

    # Process uploaded PDF file if provided
    if resume_file and resume_file.filename:
        if not resume_file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only PDF documents are currently supported."
            )
        file_bytes = await resume_file.read()
        final_text = extract_text_from_pdf(file_bytes)
    elif raw_resume_text and raw_resume_text.strip():
        final_text = raw_resume_text.strip()

    # Validate that we have both inputs
    if not final_role.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_role is required. Please specify the job role you want to analyze against."
        )

    if not final_text or len(final_text.strip()) < 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume content is required. Please provide a PDF file or at least 30 characters of resume text."
        )

    # Invoke Gemini analysis engine
    analysis = analyze_resume_with_gemini(
        resume_text=final_text,
        target_role=final_role.strip()
    )

    # Attempt persistence into Supabase analyses table
    if supabase:
        try:
            db_payload = {
                "candidate_name": analysis.candidate_name,
                "target_role": analysis.target_role,
                "match_score": analysis.match_score,
                "matched_skills": analysis.matched_skills,
                "missing_skills": [s.model_dump() for s in analysis.missing_skills],
                "roadmap": [r.model_dump() for r in analysis.learning_roadmap],
            }
            res = supabase.table("analyses").insert(db_payload).execute()
            if res.data and len(res.data) > 0:
                inserted_id = res.data[0].get("id")
                if inserted_id:
                    analysis.id = str(inserted_id)
                analysis.persisted = True
                logger.info(f"Successfully persisted analysis record {analysis.id} to Supabase.")
        except Exception as db_err:
            logger.warning(f"Could not persist analysis to Supabase (non-fatal): {db_err}")
            analysis.persisted = False

    return analysis
