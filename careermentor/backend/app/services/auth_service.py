from datetime import datetime, timedelta
import os
import uuid

import jwt
from passlib.context import CryptContext
from sqlalchemy import select

from ..db import SessionLocal
from ..models import UserAccount
from ..schemas import AuthResponse, LoginRequest, RegisterRequest


class AuthService:
    def __init__(self) -> None:
        self._pwd = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
        self._secret = os.getenv("JWT_SECRET", "careermentor-dev-secret")
        self._algo = "HS256"

    def _hash(self, password: str) -> str:
        return self._pwd.hash(password)

    def _verify(self, password: str, hashed: str) -> bool:
        return self._pwd.verify(password, hashed)

    def _token(self, user_id: str, role: str) -> str:
        payload = {
            "sub": user_id,
            "role": role,
            "exp": datetime.utcnow() + timedelta(hours=24),
        }
        return jwt.encode(payload, self._secret, algorithm=self._algo)

    def register(self, req: RegisterRequest) -> AuthResponse:
        with SessionLocal() as db:
            existing = db.execute(
                select(UserAccount).where(UserAccount.email == req.email)
            ).scalar_one_or_none()
            if existing is not None:
                raise ValueError("Email already registered")

            user_id = f"u_{uuid.uuid4().hex[:12]}"
            account = UserAccount(
                user_id=user_id,
                email=req.email.strip().lower(),
                hashed_password=self._hash(req.password),
                role=req.role,
            )
            db.add(account)
            db.commit()

        return AuthResponse(
            access_token=self._token(user_id, req.role),
            user_id=user_id,
            role=req.role,
        )

    def login(self, req: LoginRequest) -> AuthResponse:
        with SessionLocal() as db:
            account = db.execute(
                select(UserAccount).where(UserAccount.email == req.email.strip().lower())
            ).scalar_one_or_none()
            if account is None or not self._verify(req.password, account.hashed_password):
                raise ValueError("Invalid credentials")

            return AuthResponse(
                access_token=self._token(account.user_id, account.role),
                user_id=account.user_id,
                role=account.role,
            )
