from typing import Optional
from pydantic import BaseModel, Field


class JobPosting(BaseModel):
    id: str = Field(..., description="Unique job identifier")
    title: str = Field(..., description="Job role title")
    company: str = Field(..., description="Hiring organization")
    location: str = Field(..., description="Geographic or remote location")
    snippet: str = Field(..., description="Clean text summary (HTML tags stripped)")
    salary: str = Field(default="Not specified", description="Salary or compensation range")
    apply_url: str = Field(..., description="Direct link to job application")
    url: Optional[str] = Field(default=None, description="Compatibility alias for apply_url")

    def __init__(self, **data):
        # Automatically backfill url from apply_url if url not explicitly passed
        if "apply_url" in data and not data.get("url"):
            data["url"] = data["apply_url"]
        super().__init__(**data)
