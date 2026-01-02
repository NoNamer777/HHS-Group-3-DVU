import os

from dotenv import load_dotenv

load_dotenv()

# App settings
CLIENT_URL = os.environ.get("CLIENT_URL") or "*"
EPD_URL = os.environ.get("EPD_URL")
MAIL_URL = os.environ.get("MAIL_URL")
AUTH0_DOMAIN = os.environ.get("AUTH0_DOMAIN")
AUTH0_API_AUDIENCE = os.environ.get("AUTH0_API_AUDIENCE")
AUTH0_CLIENT_ID = os.environ.get("AUTH0_CLIENT_ID")
AUTH0_CLIENT_SECRET = os.environ.get("AUTH0_CLIENT_SECRET")

if not EPD_URL:
    raise RuntimeError("EPD_URL environment variable is not set")
if not MAIL_URL:
    raise RuntimeError("MAIL_URL environment variable is not set")
