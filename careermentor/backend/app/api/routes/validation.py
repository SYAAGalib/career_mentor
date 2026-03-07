from fastapi import APIRouter, Depends
from ...schemas import (
    QuizGenerationResponse,
    SkillValidationRequest,
    SkillValidationResponse,
)
from ...security import ensure_subject, require_roles
from ...services.skill_validation_service import SkillValidationService

router = APIRouter(prefix="/validation", tags=["validation"])
service = SkillValidationService()


@router.get("/generate", response_model=QuizGenerationResponse)
def generate_quiz(
    topic_id: str,
    user: dict = Depends(require_roles("learner", "admin")),
) -> QuizGenerationResponse:
    return service.generate_quiz(topic_id)


@router.post("/quiz", response_model=SkillValidationResponse)
def evaluate_quiz(
    payload: SkillValidationRequest,
    user: dict = Depends(require_roles("learner", "admin")),
) -> SkillValidationResponse:
    ensure_subject(user, payload.user_id)
    return service.evaluate(payload)
