import re
from typing import Any, Dict, List, Optional

SCORE_LINE = re.compile(r'^\s*\d+\.\s*(.+?):\s*([\d.]+)\s*/\s*10\b', re.MULTILINE)
OVERALL_LINE = re.compile(r'^\s*Overall\s*Score\s*:\s*([\d.]+)\s*/\s*10\b', re.IGNORECASE | re.MULTILINE)

def _extract_block(text: str, header: str, until_headers: List[str]) -> Optional[str]:
    """Extract section between 'header:' and next header."""
    pat = re.compile(rf'{re.escape(header)}\s*:\s*(.*)', re.IGNORECASE | re.DOTALL)
    m = pat.search(text)
    if not m:
        return None
    start = m.end() - len(m.group(1))
    end = len(text)
    for h in until_headers:
        m2 = re.search(rf'\n\s*{re.escape(h)}\s*:', text[start:], re.IGNORECASE)
        if m2:
            end = start + m2.start()
            break
    return text[start:end].strip()

def _extract_bullets(block: Optional[str]) -> List[str]:
    if not block:
        return []
    lines = []
    for line in block.splitlines():
        line = line.strip()
        if not line:
            continue
        if re.match(r'^(\*|-|•)\s+', line) or re.match(r'^\d+\.\s+\S', line):
            line = re.sub(r'^(\*|-|•)\s+', '', line)
            line = re.sub(r'^\d+\.\s+', '', line)
            lines.append(line)
    if not lines:
        for line in block.splitlines():
            t = line.strip()
            if t:
                lines.append(t)
    return lines

def parse_llm_report_to_struct(text: str) -> Dict[str, Any]:
    """
    Turn the LLM raw string into structured parts:
      - Executive summary
      - Strengths / Weaknesses
      - Metric scores
      - Overall score + status
      - Full report
    """
    text = text.strip()

    # Extract numeric scores
    scores: Dict[str, float] = {}
    for name, val in SCORE_LINE.findall(text):
        try:
            scores[name.strip()] = float(val)
        except ValueError:
            pass

    # Overall Score
    overall_score: Optional[float] = None
    m_overall = OVERALL_LINE.search(text)
    if m_overall:
        try:
            overall_score = float(m_overall.group(1))
        except ValueError:
            pass

    # Extract sections
    exec_sum = _extract_block(text, "Executive Summary", ["Strengths", "Weaknesses", "Pitch Deck Evaluation", "Notes", "Conclusions"])
    strengths_block = _extract_block(text, "Strengths", ["Weaknesses", "Executive Summary", "Pitch Deck Evaluation", "Notes"])
    weaknesses_block = _extract_block(text, "Weaknesses", ["Strengths", "Executive Summary", "Pitch Deck Evaluation", "Notes"])
    strengths = _extract_bullets(strengths_block)
    weaknesses = _extract_bullets(weaknesses_block)

    # Determine status
    def to_status(s: Optional[float]) -> str:
        if s is None:
            return "under_review"
        if s >= 7.5:
            return "accepted"
        if s >= 6.0:
            return "under_review"
        return "rejected"

    return {
        "report": text,
        "executive_summary": exec_sum or "",
        "strengths": strengths,
        "weaknesses": weaknesses,
        "scores": scores,
        "overall_score": overall_score,
        "status": to_status(overall_score),
    }