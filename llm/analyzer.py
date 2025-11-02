
from openai import OpenAI
from llm.prompts import PITCH_ANALYSIS_PROMPT
from llm.clients import call_model

def analyze_pitch_deck(deck_text: str) -> str:
    prompt = PITCH_ANALYSIS_PROMPT.format(deck_text=deck_text[:5000])
    response = call_model(prompt)
    return response

def parse_llm_response(response_text: str) -> dict:
    """
    Very basic parser for now. Can later use regex or bullet detection.
    """
    #print("LLM Response:\n", response_text)
    
    # Example placeholder parsing:
    scores = {}
    lines = response_text.split("\n")
    for line in lines:
        if ":" in line:
            key, val = line.split(":", 1)
            try:
                score = int(val.strip().split("/")[0])
                scores[key.strip()] = score
            except ValueError:
                scores[key.strip()] = val.strip()

    return scores