import os
from typing import Callable

import jwt
from fastapi import Depends, Header, HTTPException


SECRET = os.getenv("JWT_SECRET", "careermentor-dev-secret")
ALGO = "HS256"


def _decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
        if not isinstance(payload, dict):
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return payload
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    return _decode_token(token)


def require_roles(*roles: str) -> Callable[[dict], dict]:
    def _require(user: dict = Depends(get_current_user)) -> dict:
        role = user.get("role")
        if roles and role not in roles:
            raise HTTPException(status_code=403, detail="Forbidden role")
        return user

    return _require


def ensure_subject(user: dict, user_id: str) -> None:
    if user.get("sub") != user_id and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Token subject mismatch")
