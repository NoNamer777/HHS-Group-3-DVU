import os

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from project.auth_setup import auth0
from project.db.models.user import TokenResponse
from project.globals import (
    AUTH0_API_AUDIENCE,
    AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET,
    AUTH0_DOMAIN,
)

bearer_scheme = HTTPBearer(auto_error=True)

# M2M tokens from Auth0 Management API have these scopes
# We map them to allow access to our endpoints
M2M_ALLOWED_SCOPES = {
    "read:users",
    "update:users",
    "delete:users",
    "create:users",
    "read:clients",
    "update:clients",
}

# Scope mapping: our custom scopes -> Auth0 Management API scopes that grant access
SCOPE_MAPPING = {
    # Patient scopes
    "patients:get": ["read:users", "read:clients"],
    "patients:create": ["create:users", "update:clients"],
    "patients:update": ["update:users", "update:clients"],
    "patients:remove": ["delete:users", "update:clients"],
    # Encounter scopes
    "encounters:get": ["read:users", "read:clients"],
    "encounters:create": ["create:users", "update:clients"],
    "encounters:update": ["update:users", "update:clients"],
    "encounters:remove": ["delete:users", "update:clients"],
    # Mail scopes
    "mails:get": ["read:users", "read:clients"],
    "mails:create": ["create:users", "update:clients"],
    "mails:update": ["update:users", "update:clients"],
    "mails:remove": ["delete:users", "update:clients"],
}


def get_bearer_token(
    token: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    _: dict = Depends(auth0.require_auth()),
) -> str:
    if token.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return token.credentials


def create_header(token: str) -> dict:
    """
    Create header
    """
    return {"Authorization": f"Bearer {token}"}


def check_scope(required: str):
    """
    Check if the token has the required scope.
    
    Supports both:
    - Custom scopes (e.g., "patients:get")
    - Auth0 Management API scopes (mapped to custom scopes)
    
    In development mode, scope checking can be bypassed with SKIP_SCOPE_CHECK=true
    """
    async def dep(claims: dict = Depends(auth0.require_auth())):
        # Skip scope check in development if configured
        if os.environ.get("SKIP_SCOPE_CHECK", "").lower() == "true":
            return claims
        
        scopes = set((claims.get("scope") or "").split())
        
        # Check if the exact required scope is present
        if required in scopes:
            return claims
        
        # Check if any mapped M2M scope is present
        mapped_scopes = SCOPE_MAPPING.get(required, [])
        if any(scope in scopes for scope in mapped_scopes):
            return claims
        
        # Check if this is an M2M token with broad permissions
        # M2M tokens with read:users or update:clients typically have full access
        if scopes & M2M_ALLOWED_SCOPES:
            return claims
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden"
        )

    return dep


async def create_token_service() -> TokenResponse:
    """
    Create token for the user (only for debug)
    """

    url = f"https://{AUTH0_DOMAIN}/oauth/token"
    payload = {
        "grant_type": "client_credentials",
        "client_id": AUTH0_CLIENT_ID,
        "client_secret": AUTH0_CLIENT_SECRET,
        "audience": AUTH0_API_AUDIENCE,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=payload)
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="Auth0 niet bereikbaar"
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc

    data = response.json()
    return TokenResponse.model_validate(data)
