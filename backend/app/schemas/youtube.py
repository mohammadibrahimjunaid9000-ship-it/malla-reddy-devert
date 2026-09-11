from pydantic import BaseModel, Field


class YouTubeVideoItem(BaseModel):
    video_id: str = Field(..., alias="videoId", description="YouTube Video ID")
    title: str = Field(..., description="Video Title")
    channel_title: str = Field(..., alias="channelTitle", description="Channel or Creator Name")
    thumbnail_url: str = Field(..., alias="thumbnailUrl", description="Thumbnail Image URL")
    embed_url: str = Field(..., alias="embedUrl", description="YouTube Embed URL")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "videoId": "gQTRsZea1X8",
                "title": "FastAPI Course for Beginners",
                "channelTitle": "freeCodeCamp.org",
                "thumbnailUrl": "https://i.ytimg.com/vi/gQTRsZea1X8/hqdefault.jpg",
                "embedUrl": "https://www.youtube.com/embed/gQTRsZea1X8"
            }
        }
