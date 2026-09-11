from typing import List, Optional, Union
from pydantic import BaseModel, Field


class DSAQuestion(BaseModel):
    id: Union[int, str] = Field(..., description="Problem unique ID")
    title: str = Field(..., description="LeetCode problem title")
    difficulty: str = Field(..., description="Problem difficulty rating (Easy, Medium, Hard)")
    topic: Optional[str] = Field(default="Algorithms", description="Topic or algorithmic pattern (e.g. Array, Hash Table)")
    leetcode_url: str = Field(..., description="Direct URL to problem on LeetCode")
    companies: List[str] = Field(default_factory=list, description="List of companies where this problem was asked")
    
    # Backward-compatible aliases for legacy UI and tests
    pattern: Optional[str] = Field(default=None, description="Algorithmic pattern or topic")
    company: Optional[str] = Field(default=None, description="Primary company name")
    frequency: Optional[str] = Field(default="High", description="Interview frequency")

    def __init__(self, **data):
        if "topic" in data and not data.get("pattern"):
            data["pattern"] = data["topic"]
        if "companies" in data and data["companies"] and not data.get("company"):
            data["company"] = data["companies"][0]
        super().__init__(**data)
