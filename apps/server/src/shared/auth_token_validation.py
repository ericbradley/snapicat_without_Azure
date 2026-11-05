from azure.functions import HttpRequest
import logging
import os
import json
from functools import lru_cache
import jwt.algorithms
import requests
import jwt
from jwt.algorithms import RSAAlgorithm
import uuid
from typing import Optional, Dict, Any

from .constants import (
    AZURE_AD_ISSUER_BASE, AZURE_AD_DISCOVERY_PATH
)

class TokenValidationError(Exception):
    """Custom exception for token validation errors"""
    pass

@lru_cache(maxsize=1)
def get_jwks() -> Optional[Dict[str, Any]]:
    """Fetch JWKS from Azure AD and cache it"""
    tenant_id = os.environ.get("AZURE_TENANT_ID")
    if not tenant_id:
        raise TokenValidationError("AZURE_TENANT_ID environment variable not set")

    jwks_uri = f"{AZURE_AD_ISSUER_BASE}/{tenant_id}{AZURE_AD_DISCOVERY_PATH}"
    correlation_id = str(uuid.uuid4())

    try:
        response = requests.get(jwks_uri, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"[{correlation_id}] Failed to fetch JWKS: {str(e)}")
        raise TokenValidationError(f"Failed to fetch JWKS: {str(e)}")
    except Exception as e:
        logging.error(f"[{correlation_id}] Unexpected error fetching JWKS: {str(e)}")
        raise TokenValidationError(f"Unexpected error fetching JWKS: {str(e)}")

def get_rsa_public_key(token: str) -> Optional[jwt.algorithms.RSAAlgorithm]:
    """Get RSA key from JWKS based on token header"""
    correlation_id = str(uuid.uuid4())
    try:
        jwks = get_jwks()
        if not jwks or 'keys' not in jwks:
            logging.error(f"[{correlation_id}] JWKS is empty or does not contain keys")
            raise TokenValidationError("Invalid JWKS response")

        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get('kid')
        if not kid:
            logging.error(f"[{correlation_id}] Token header missing 'kid'")
            raise TokenValidationError("Invalid token header")

        # Find the key with matching kid
        for key in jwks['keys']:
            if key['kid'] == kid:
                return RSAAlgorithm.from_jwk(json.dumps(key))

        logging.error(f"[{correlation_id}] No matching key found for kid: {kid}")
        raise TokenValidationError("No matching key found")
    except Exception as e:
        logging.error(f"[{correlation_id}] Error extracting RSA public key: {str(e)}")
        raise TokenValidationError(f"Error extracting RSA public key: {str(e)}")

async def validate_token(req: HttpRequest) -> Optional[Dict[str, Any]]:
    """Validate JWT token from request header - BYPASSE
D FOR LOCAL DEV"""
    correlation_id = str(uuid.uuid4())
    logging.info(f"[{correlation_id}] Auth bypassed - returning mock user")
    
    # Return a mock user object that mimics a valid decoded token
    return {
        "sub": "local-dev-user",
        "name": "Local Development User",
        "email": "dev@localhost",
        "oid": "00000000-0000-0000-0000-000000000000",
        "preferred_username": "dev@localhost",
        "roles": ["admin"]
    }        
        
