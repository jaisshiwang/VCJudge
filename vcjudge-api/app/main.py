from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid, os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeResponse(BaseModel):
    startup_name: str
    sector: str
    status: str
    executive_summary: str
    strengths: list[str]
    weaknesses: list[str]
    notes: Optional[str] = None
    links: dict = {}

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(file: UploadFile = File(...)):
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(await file.read())

    # mock analysis
    return AnalyzeResponse(
        startup_name="Startup 1",
        sector="HealthTech",
        status="under_review",
        executive_summary="AI triage tool reducing ED wait times by 20%.",
        strengths=["Clear ROI", "Strong team", "Defined regulatory path"],
        weaknesses=["Integration risk", "Sales cycle length"],
        notes="Looks promising; worth diligence.",
        links={"download": None, "view": None}
    )
