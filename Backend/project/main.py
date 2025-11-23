from fastapi import FastAPI

from project.middleware.cors import setup_cors_middleware


def add_middleware(app: FastAPI) -> None:
    """apply middleware handlers"""
    # Provide allowed_origins to the CORS setup. Adjust as needed for your environment.
    setup_cors_middleware(app, allowed_origins=["*"])

def build_app() -> FastAPI:
    """
    Build and configure the FastAPI app with optional settings override.
    """
    app = FastAPI(
    root_path="/api",
    )
    return app

app: FastAPI = build_app()

@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    """
    Root endpoint to check if the API is running.
    """
    return {"message": "Hello World!!"}
