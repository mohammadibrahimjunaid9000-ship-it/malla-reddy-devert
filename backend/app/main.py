import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.analyze import router as analyze_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.dsa import router as dsa_router
from app.core.supabase import supabase

app = FastAPI(
    title="SkillBridge API",
    description="AI-powered skill-gap analyzer backend",
    version="1.0.0"
)

# Configure CORS middleware allowing frontend requests
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(analyze_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(dsa_router, prefix="/api")

@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend service status."""
    return {"status": "healthy"}

@app.get("/api/test-db", tags=["Database"])
def test_db_connection():
    """Test connection to Supabase database."""
    if not supabase:
        return {"status": "error", "detail": "Supabase client is not initialized"}
    try:
        response = supabase.table("analyses").select("id").limit(1).execute()
        return {"status": "connected", "data": response.data}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
