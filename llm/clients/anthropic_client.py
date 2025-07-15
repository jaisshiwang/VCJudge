from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT
from utils.file_handler import load_config

config = load_config()
client = Anthropic(api_key=config.anthropic.api_key)

def call_model(prompt: str) -> str:
    full_prompt = f"{HUMAN_PROMPT} {prompt}{AI_PROMPT}"
    response = client.completions.create(
        model=config.anthropic.model,
        prompt=full_prompt,
        max_tokens_to_sample=1024,
        temperature=config.llm.temperature
    )
    return response.completion.strip()