from pydantic import BaseModel
from agents import translate_agent

from fastapi import APIRouter

router = APIRouter()

class TranslateRequest(BaseModel):
    transcription: str
    language: str

@router.post("/video/translate")
async def create_video_translation(request: TranslateRequest):
    message = f"Translate the following to {request.language}:\n\n{request.transcription}"
    result = await translate_agent.ainvoke({"messages": [{"role": "user", "content": message}]})
    return {"translation": result["messages"][-1].content}
