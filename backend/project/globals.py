import os

from dotenv import load_dotenv

load_dotenv()

# App settings
CLIENT_URL = os.environ.get("CLIENT_URL") or "*"
EPD_URL = os.environ.get("EPD_URL")
MAIL_URL = os.environ.get("MAIL_URL")

if not EPD_URL:
    raise RuntimeError("EPD_URL environment variable is not set")
if not MAIL_URL:
    raise RuntimeError("MAIL_URL environment variable is not set")
