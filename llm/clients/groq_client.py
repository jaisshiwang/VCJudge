import openai
from utils.file_handler import load_config

config = load_config()
openai.api_key = config.groq.api_key
openai.base_url = config.groq.base_url

def call_model(prompt: str) -> str:
    response = openai.ChatCompletion.create(
        model=config.llm.model,
        messages=[
            {"role": "system", "content": "You are an expert VC analyst."},
            {"role": "user", "content": prompt}
        ],
        temperature=config.llm.temperature,
        max_tokens=1024
    )
    return response.choices[0].message.content.strip()