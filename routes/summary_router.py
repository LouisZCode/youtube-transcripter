import logging
from pydantic import BaseModel
from agents import summary_agent

from fastapi import APIRouter, Depends, HTTPException
from dependencies.auth import require_premium

logger = logging.getLogger(__name__)

router = APIRouter()

class SummaryRequest(BaseModel):
    transcription: str

@router.post("/video/summary")
async def create_video_summary(request: SummaryRequest, user=Depends(require_premium)):
    try:
        summary = await summary_agent.ainvoke({"messages" : [{"role" : "user" , "content" : request.transcription}]})
        result = summary["messages"][-1].content
        return {"summary" : result}
    except Exception:
        logger.exception("Summary generation failed")
        raise HTTPException(status_code=502, detail="Summary service temporarily unavailable")