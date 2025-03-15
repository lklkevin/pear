import logging
import os
from dotenv import load_dotenv

load_dotenv()

log_level_str = os.environ.get("LOG_LEVEL", "DEBUG").upper()
log_level = getattr(logging, log_level_str, logging.DEBUG)

logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from backend.app import app
from waitress import serve

if __name__ == '__main__':
    serve(app, host='0.0.0.0', port=5000)
