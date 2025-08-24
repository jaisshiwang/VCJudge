from llama_cpp import Llama
from utils.file_handler import load_config

config = load_config()
llm = Llama(
    model_path=config.llama.model_path,
    n_ctx=config.llama.n_ctx,
    n_threads=config.llama.n_threads
)

def call_model(prompt: str) -> str:
    output = llm(prompt, max_tokens=1024, temperature=config.llm.temperature)
    return output["choices"][0]["text"].strip()