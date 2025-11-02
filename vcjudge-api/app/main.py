from typing import Any
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
import uuid, os, sys, logging

from .logger import setup_logger
logger = setup_logger()

from .report_parser import parse_llm_report_to_struct

# --- Make sure project root is importable (so `llm` works) ---
ROOT = Path(__file__).resolve().parents[1]   # vc-judge-api/
PROJECT_ROOT = ROOT.parent                   # VCJudge/
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# --- Your modules ---
from llm.extractor import extract_text
from llm.analyzer import analyze_pitch_deck

# --- Logging ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("vcjudge-api")

# --- FastAPI setup ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/health")
def health():
    return {"ok": True}

def _to_report_text(raw: Any) -> str:
    """
    Coerce whatever the analyzer returns into a single human-readable report string.
    - If it's already a string, return as-is.
    - If it's a dict, pretty-join keys/values deterministically.
    - Otherwise, stringify.
    """
    if isinstance(raw, str):
        return raw.strip()

    if isinstance(raw, dict):
        # Preserve common sections if they exist (optional)
        preferred = [
            "LLM Response", "report", "Executive Summary", "executive_summary",
            "Overall Score", "overall_score", "scores",
            "Strengths", "strengths", "Weaknesses", "weaknesses",
            "notes", "sector", "status",
        ]
        lines = []

        def _fmt_val(v):
            if isinstance(v, (list, tuple)):
                return "\n".join(f"- {x}" for x in v)
            return str(v)

        # preferred keys first
        for k in preferred:
            if k in raw and raw[k] is not None:
                lines.append(f"{k}:\n{_fmt_val(raw[k])}")

        # then any remaining keys
        for k, v in raw.items():
            if k in preferred or v is None:
                continue
            lines.append(f"{k}:\n{_fmt_val(v)}")

        return ("\n\n".join(lines)).strip() or str(raw)

    return str(raw).strip()

@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    # 1) Save upload
    fname = f"{uuid.uuid4()}_{file.filename}"
    fpath = UPLOAD_DIR / fname
    with open(fpath, "wb") as f:
        f.write(await file.read())

    try:
        # 2) Extract + Analyze
        pitch_text = extract_text(str(fpath))
        raw = analyze_pitch_deck(pitch_text)

        # 3) Parse the raw report to structured data and return at top-level
        parsed = parse_llm_report_to_struct(raw)
        payload = {**parsed, "download": f"/files/{fname}"}
        
        logger.info("Analysis OK for %s", fname)
        return JSONResponse(content=payload, status_code=200)

    except Exception as e:
        logger.critical("App failed on %s: %s", fname, e)
        return JSONResponse(
            content={"report": f"Failed to analyze {fname}: {e}", "download": f"/files/{fname}"},
            status_code=500,
        )

@app.get("/files/{name}")
def download(name: str):
    path = UPLOAD_DIR / name
    if path.exists():
        return FileResponse(path)
    return JSONResponse(content={"error": "not found"}, status_code=404)