from utils.file_handler import load_config

config = load_config()
provider = config.llm.provider

if provider == "openai":
    from .openai_client import call_model
elif provider == "anthropic":
    from .anthropic_client import call_model
elif provider == "llama":
    from .llama_client import call_model
elif provider == "groq":
    from .groq_client import call_model
else:
    raise ValueError(f"Unsupported provider: {provider}")