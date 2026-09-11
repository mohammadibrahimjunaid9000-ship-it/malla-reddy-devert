from typing import Literal
from pydantic import BaseModel, Field


class DSAQuestion(BaseModel):
    id: str = Field(..., description="Problem unique ID")
    company: str = Field(..., description="Target company (e.g. Google, Meta, Amazon)")
    title: str = Field(..., description="LeetCode problem title")
    difficulty: Literal["Easy", "Medium", "Hard"] = Field(..., description="Problem difficulty rating")
    pattern: str = Field(..., description="Core algorithmic pattern (e.g. Monotonic Stack, Sliding Window)")
    frequency: Literal["Very High", "High"] = Field(..., description="Historical interview frequency")
    leetcode_url: str = Field(..., description="Direct URL to problem on LeetCode")
