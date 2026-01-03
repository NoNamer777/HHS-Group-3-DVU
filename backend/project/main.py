from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

import httpx
from fastapi import FastAPI

from project.globals import CLIENT_URL
from project.middleware.cors import setup_cors_middleware
from project.routes import auth, encounters, mails, patients


def add_middleware(app: FastAPI) -> None:
    """apply middleware handlers"""
    # Provide allowed_origins to the CORS setup. Adjust as needed for your environment.
    if CLIENT_URL is not None:
        setup_cors_middleware(app, allowed_origins=[CLIENT_URL])


def build_app() -> FastAPI:
    """
    Build and configure the FastAPI app with optional settings override.
    """
    app = FastAPI(root_path="/api", lifespan=lifespan)
    add_middleware(app)
    return app


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[Any, Any]:
    """
    Context manager that sets up and tears down resources.
    """
    app.state.http = httpx.AsyncClient()
    yield


app: FastAPI = build_app()

app.include_router(auth.router)
app.include_router(encounters.router)
app.include_router(patients.router)
app.include_router(mails.router)


@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    """
    Root endpoint to check if the API is running.
    """
    return {"message": "Hello World!!"}
