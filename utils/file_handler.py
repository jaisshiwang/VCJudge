from pydantic import BaseModel
from typing import Optional
import yaml

class LLMConfig(BaseModel):
    provider: str
    model: str
    temperature: float = 0.3

class OpenAIConfig(BaseModel):
    api_key: str
    model: Optional[str] = None

class AnthropicConfig(BaseModel):
    api_key: str
    model: Optional[str] = None

class GroqConfig(BaseModel):
    api_key: str
    base_url: str

class LlamaConfig(BaseModel):
    model_path: str
    n_ctx: int = 2048
    n_threads: int = 4

class AppConfig(BaseModel):
    llm: LLMConfig
    openai: Optional[OpenAIConfig]
    anthropic: Optional[AnthropicConfig]
    groq: Optional[GroqConfig]
    llama: Optional[LlamaConfig]

def load_config(path: str = "config/settings.yaml") -> AppConfig:
    with open(path, "r") as f:
        data = yaml.safe_load(f)
    return AppConfig(**data)