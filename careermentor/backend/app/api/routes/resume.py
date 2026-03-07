from fastapi import APIRouter, Depends
from ...schemas import ResumeBuildRequest, ResumeBuildResponse
from ...security import ensure_subject, require_roles
from ...services.resume_builder_service import ResumeBuilderService

router = APIRouter(prefix="/resume", tags=["resume"])
service = ResumeBuilderService()


@router.post("/build", response_model=ResumeBuildResponse)
def build_resume(
    payload: ResumeBuildRequest,
    user: dict = Depends(require_roles("learner", "admin")),
) -> ResumeBuildResponse:
    ensure_subject(user, payload.user_id)
    return service.build(payload)
