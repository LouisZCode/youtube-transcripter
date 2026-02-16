import os
import re
import json
import urllib.request
import urllib.error

from fastapi import APIRouter
from fastapi.responses import Response
from fpdf import FPDF
from pydantic import BaseModel

router = APIRouter()

_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
_LOGO_PATH = os.path.join(_DATA_DIR, "tubetext_logo.png")
_FONT_REGULAR = os.path.join(_DATA_DIR, "fonts", "DejaVuSans.ttf")
_FONT_BOLD = os.path.join(_DATA_DIR, "fonts", "DejaVuSans-Bold.ttf")


def _fetch_video_title(video_id: str | None) -> str:
    """Fetch title via YouTube oEmbed (no API key needed). Falls back to 'Transcript'."""
    if not video_id:
        return "Transcript"
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        req = urllib.request.Request(url, headers={"User-Agent": "TubeText/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            return data.get("title", "Transcript")
    except Exception:
        return "Transcript"


def _safe_filename(title: str) -> str:
    """Create a filesystem-safe filename from a video title."""
    name = re.sub(r"[^\w\s-]", "", title)
    name = re.sub(r"\s+", "_", name.strip())
    if not name:
        return "transcript.pdf"
    return name[:80] + "_Transcript.pdf"


def _build_pdf(segments: list[dict], title: str) -> bytes:
    """Build a branded PDF with timestamped transcript segments."""
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_font("DejaVu", "", _FONT_REGULAR, uni=True)
    pdf.add_font("DejaVu", "B", _FONT_BOLD, uni=True)
    pdf.add_page()

    # --- Branded header ---
    pdf.image(_LOGO_PATH, x=10, y=10, w=18)
    pdf.set_xy(30, 14)
    pdf.set_font("DejaVu", "B", 16)
    pdf.cell(0, 9, "TubeText", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("DejaVu", "", 9)
    pdf.set_text_color(140, 140, 140)
    pdf.set_xy(10, 14)
    pdf.cell(0, 9, "tubetext.app", align="R", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(0, 0, 0)
    pdf.ln(4)

    # --- Video title (centered) ---
    pdf.set_font("DejaVu", "B", 13)
    pdf.multi_cell(0, 7, title, align="C")
    pdf.ln(2)

    # --- Divider (below title) ---
    y = pdf.get_y()
    pdf.set_draw_color(210, 210, 210)
    pdf.line(10, y, 200, y)
    pdf.ln(6)

    # --- Segments ---
    for seg in segments:
        # Timestamp — bold black, on its own line
        pdf.set_font("DejaVu", "B", 10)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 5, seg.get("timestamp", ""), new_x="LMARGIN", new_y="NEXT")

        # Text — regular black, below timestamp
        pdf.set_font("DejaVu", "", 10)
        pdf.multi_cell(0, 5, seg.get("text", ""))
        pdf.ln(3)

    return bytes(pdf.output())


class PdfRequest(BaseModel):
    segments: list[dict]
    video_id: str | None = None


@router.post("/video/pdf/")
async def get_video_pdf(request: PdfRequest):
    title = _fetch_video_title(request.video_id)
    filename = _safe_filename(title)
    pdf_bytes = _build_pdf(request.segments, title)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )
