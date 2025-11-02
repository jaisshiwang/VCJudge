import logging
import json
import time
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any, Dict, Optional

LOG_DIR = Path(__file__).resolve().parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

LOG_FILE = LOG_DIR / "vcjudge_api.log"

class JsonFormatter(logging.Formatter):
    """Format logs as JSON for structured logging."""
    def format(self, record: logging.LogRecord) -> str:
        base_log = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
        }
        # Include any additional contextual attributes
        if hasattr(record, "extra_data") and isinstance(record.extra_data, dict):
            base_log.update(record.extra_data)
        return json.dumps(base_log)

def setup_logger(name: str = "vcjudge-api", json_mode: bool = False) -> logging.Logger:
    """Set up and return a configured logger."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    if logger.handlers:
        return logger

    # --- Formatter ---
    if json_mode:
        formatter = JsonFormatter(datefmt="%Y-%m-%d %H:%M:%S")
    else:
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    # --- Console handler ---
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # --- Rotating file handler ---
    file_handler = RotatingFileHandler(LOG_FILE, maxBytes=5_000_000, backupCount=5)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger

# --- Utility functions for logging requests/responses ---

def log_request_start(logger: logging.Logger, filename: str, size: Optional[int] = None, client: Optional[str] = None):
    extra = {"filename": filename, "event": "request_start"}
    if size:
        extra["file_size"] = size
    if client:
        extra["client"] = client
    logger.info(f"Incoming file: {filename} ({size or '?'} bytes)", extra={"extra_data": extra})

def log_request_end(logger: logging.Logger, filename: str, status_code: int, duration: float, result_summary: Optional[Dict[str, Any]] = None):
    extra = {
        "filename": filename,
        "event": "request_end",
        "status_code": status_code,
        "duration_ms": round(duration * 1000, 2),
    }
    if result_summary:
        extra.update(result_summary)
    logger.info(f"Completed analysis for {filename} (status={status_code}, {duration:.2f}s)", extra={"extra_data": extra})

def log_error(logger: logging.Logger, error: Exception, context: Optional[Dict[str, Any]] = None):
    extra = {"event": "error"}
    if context:
        extra.update(context)
    logger.error(f"Error occurred: {error}", exc_info=True, extra={"extra_data": extra})