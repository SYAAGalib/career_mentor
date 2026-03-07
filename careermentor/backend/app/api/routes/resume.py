from fastapi import APIRouter
from ...schemas import ResumeBuildRequest, ResumeBuildResponse
from ...services.resume_builder_service import ResumeBuilderService

router = APIRouter(prefix="/resume", tags=["resume"])
service = ResumeBuilderService()


@router.post("/build", response_model=ResumeBuildResponse)
def build_resume(payload: ResumeBuildRequest) -> ResumeBuildResponse:
    return service.build(payload)
