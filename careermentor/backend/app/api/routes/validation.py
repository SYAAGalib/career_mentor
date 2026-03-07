from fastapi import APIRouter
from ...schemas import (
    QuizGenerationResponse,
    SkillValidationRequest,
    SkillValidationResponse,
)
from ...services.skill_validation_service import SkillValidationService

router = APIRouter(prefix="/validation", tags=["validation"])
service = SkillValidationService()


@router.get("/generate", response_model=QuizGenerationResponse)
def generate_quiz(topic_id: str) -> QuizGenerationResponse:
    return service.generate_quiz(topic_id)


@router.post("/quiz", response_model=SkillValidationResponse)
def evaluate_quiz(payload: SkillValidationRequest) -> SkillValidationResponse:
    return service.evaluate(payload)
