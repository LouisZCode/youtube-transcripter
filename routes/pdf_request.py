from fastapi import APIRouter
from fastapi.responses import Response

from fpdf import FPDF
from pydantic import BaseModel

router = APIRouter()

def _build_pdf(segments: list[dict]) -> bytes:
    """Build a PDF with timestamped transcript segments."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=11)
    for seg in segments:
        pdf.multi_cell(0, 6, f'{seg["timestamp"]} {seg["text"]}')
        pdf.ln(2)
    return bytes(pdf.output())


class PdfRequest(BaseModel):
    segments: list[dict]

@router.post("/video/pdf/")
async def get_video_pdf(request: PdfRequest):
    pdf_bytes = _build_pdf(request.segments)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="transcript.pdf"'
        },
    )