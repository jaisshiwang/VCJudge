# HyperVC — AI Pitch Deck Analyzer

HyperVC analyzes startup pitch decks using large language models to produce actionable insights, highlight strengths and weaknesses, and provide an investment-readiness score.

---

## Project Overview

### Tech stack
- Backend: FastAPI (Python)
- Frontend: Next.js (React)
- LLM Processing: Python-based analyzer (OpenAI / Groq-compatible)
- Logging: Structured rotating-file logs (`hypervc_api.log`)

### Repository layout
HyperVC/
├─ llm/                     # Core text extraction & analysis
│   ├─ analyzer.py
│   ├─ extractor.py
│   └─ prompts.py
│
├─ vcjudge-api/             # Backend (FastAPI)
│   ├─ app/
│   │   ├─ main.py
│   │   ├─ logger.py
│   │   ├─ report_parser.py
│   │   └─ logs/
│   └─ requirements.txt
│
├─ vcjudge-web/             # Frontend (Next.js)
│   ├─ src/app/page.tsx
│   └─ package.json
│
└─ README.md

---

## Requirements

- Python 3.11+
- Node.js v20+
- npm or yarn
- (Optional) virtualenv or conda

---

## Backend (vcjudge-api)

1. Create and activate a virtual environment

Unix / macOS:
```bash
cd vcjudge-api
python -m venv .venv
source .venv/bin/activate
```

Windows (PowerShell):
```powershell
cd vcjudge-api
python -m venv .venv
.venv\Scripts\Activate.ps1
```

2. Install Python dependencies
```bash
pip install -r requirements.txt
```

3. Run the FastAPI server
```bash
uvicorn app.main:app --reload --port 8000
```

Logs are written to:
- vcjudge-api/app/logs/hypervc_api.log

---

## Frontend (vcjudge-web)

1. Install Node dependencies
```bash
cd ../vcjudge-web
npm install
# or
# yarn install
```

2. Start the development server
```bash
npm run dev
# or
# yarn dev
```

---

## Common commands

- Start API server
```bash
uvicorn app.main:app --reload --port 8000
```

- Start frontend
```bash
npm run dev
```

- Stream backend logs
```bash
tail -f vcjudge-api/app/logs/hypervc_api.log
```

- Add a Python dependency (backend)
```bash
pip install <package>
```

- Add a Node dependency (frontend)
```bash
npm install <package>
# or
# yarn add <package>
```

---

## Notes & Best practices

- Use a dedicated virtual environment per project.
- Keep secrets (API keys) out of source control — use environment variables or a secrets manager.
- Pin production dependencies where stability is required.
- Add tests and CI for critical analysis paths (LLM prompts, parsers).

If you want, I can:
- Add a sample .env.example and instructions to configure API keys.
- Expand the troubleshooting or deployment section.
- Create a contribution guide and code-of-conduct.
