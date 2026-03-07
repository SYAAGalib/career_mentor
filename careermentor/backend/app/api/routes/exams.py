from fastapi import APIRouter

from ...schemas import ExamSubmitRequest, ExamSubmitResponse
from ...services.exam_service import ExamService

router = APIRouter(prefix="/exams", tags=["exams"])
service = ExamService()


@router.post("/submit", response_model=ExamSubmitResponse)
def submit_exam(payload: ExamSubmitRequest) -> ExamSubmitResponse:
    return service.submit(payload)
