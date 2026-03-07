from fastapi import APIRouter, HTTPException

from ...schemas import AuthResponse, GuestAuthRequest, LoginRequest, RegisterRequest
from ...services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
service = AuthService()


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest) -> AuthResponse:
    try:
        return service.register(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    try:
        return service.login(payload)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.post("/guest", response_model=AuthResponse)
def guest(payload: GuestAuthRequest) -> AuthResponse:
    return service.issue_guest_token(payload.user_id, payload.role)
