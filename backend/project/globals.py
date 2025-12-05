import os

from dotenv import load_dotenv

load_dotenv()

# App settings
CLIENT_URL = os.environ.get("CLIENT_URL")
EPD_URL = os.environ.get("EPD_URL")

if not EPD_URL:
    raise RuntimeError("EPD_URL environment variable is not set")
