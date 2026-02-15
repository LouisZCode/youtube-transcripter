from fastapi import APIRouter
from fastapi.responses import Response

from fpdf import FPDF
from pydantic import BaseModel

router = APIRouter()

def _sanitize_text(text: str) -> str:
    """Replace Unicode characters unsupported by Helvetica with ASCII equivalents."""
    replacements = {
        "\u201c": '"', "\u201d": '"',  # curly double quotes
        "\u2018": "'", "\u2019": "'",  # curly single quotes
        "\u2013": "-", "\u2014": "-",  # en/em dash
        "\u2026": "...",               # ellipsis
        "\u00a0": " ",                 # non-breaking space
    }
    for orig, repl in replacements.items():
        text = text.replace(orig, repl)
    return text.encode("latin-1", errors="replace").decode("latin-1")

def _build_pdf(segments: list[dict]) -> bytes:
    """Build a PDF with timestamped transcript segments."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=11)
    for seg in segments:
        line = _sanitize_text(f'{seg["timestamp"]} {seg["text"]}')
        pdf.multi_cell(0, 6, line)
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