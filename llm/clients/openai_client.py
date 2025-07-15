
import openai
from utils.file_handler import load_config

config = load_config()
openai.api_key = config.openai.api_key

def call_model(prompt: str) -> str:
    response = openai.ChatCompletion.create(
        model=config.openai.model,
        messages=[
            {"role": "system", "content": "You are an expert VC analyst."},
            {"role": "user", "content": prompt}
        ],
        temperature=config.llm.temperature
    )
    return response.choices[0].message.content.strip()