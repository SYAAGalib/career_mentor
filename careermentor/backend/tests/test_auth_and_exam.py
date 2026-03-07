from app.services.auth_service import AuthService
from app.services.exam_service import ExamService
from app.schemas import LoginRequest, RegisterRequest, ExamSubmitRequest
from app.db import Base, engine
from app import models  # noqa: F401
import uuid


def setup_module(module):
    Base.metadata.create_all(bind=engine)


def test_register_and_login_success():
    auth = AuthService()

    email = f"test_user_auth_{uuid.uuid4().hex[:8]}@example.com"
    password = "StrongPass123"

    reg = auth.register(RegisterRequest(email=email, password=password, role="learner"))
    assert reg.access_token
    assert reg.user_id.startswith("u_")

    login = auth.login(LoginRequest(email=email, password=password))
    assert login.access_token
    assert login.user_id == reg.user_id


def test_exam_cooldown_after_failure():
    exams = ExamService()

    failed = exams.submit(
        ExamSubmitRequest(user_id="u_cooldown", section="Foundations", score=50)
    )
    assert failed.passed is False
    assert failed.cooldown_until is not None

    immediate_retry = exams.submit(
        ExamSubmitRequest(user_id="u_cooldown", section="Foundations", score=95)
    )
    assert immediate_retry.passed is False
    assert immediate_retry.cooldown_until is not None
