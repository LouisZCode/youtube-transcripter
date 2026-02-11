from pydantic import BaseModel
from agents import summary_agent

from fastapi import APIRouter

router = APIRouter()

class SummaryRequest(BaseModel):
    transcription: str

@router.post("/video/summary")
async def create_video_summary(request : SummaryRequest):
    summary = await summary_agent.ainvoke({"messages" : [{"role" : "user" , "content" : request.transcription}]})
    result = summary["messages"][-1].content
    return {"summary" : result}