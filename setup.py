from setuptools import setup, find_packages

setup(
    name="VCJudge",
    version="0.1.0",
    description="LLM utility to evaluate startup pitch decks based on key VC metrics.",
    author="Shiwang Jaiswal",
    packages=find_packages(include=["llm", "llm.*", "utils", "utils.*"]),
    install_requires=[
        "openai",
        "llama-cpp-python",
        "anthropic",
        "groq",
        "PyMuPDF",
        "python-pptx",
        "PyYAML",
        "pydantic",
        "tqdm"
    ],
    entry_points={
        "console_scripts": [
            "vcjudge=main:main"
        ]
    },
    classifiers=[
        "Programming Language :: Python :: 3.13",
        "Operating System :: OS Independent",
    ],
)