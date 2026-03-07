from fastapi import APIRouter, Depends

from ...schemas import ExamSubmitRequest, ExamSubmitResponse
from ...security import ensure_subject, require_roles
from ...services.exam_service import ExamService

router = APIRouter(prefix="/exams", tags=["exams"])
service = ExamService()


@router.post("/submit", response_model=ExamSubmitResponse)
def submit_exam(
    payload: ExamSubmitRequest,
    user: dict = Depends(require_roles("learner", "admin")),
) -> ExamSubmitResponse:
    ensure_subject(user, payload.user_id)
    return service.submit(payload)
