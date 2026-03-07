from fastapi import APIRouter, Depends
from ...schemas import GenerateRoadmapRequest, GenerateRoadmapResponse
from ...security import ensure_subject, require_roles
from ...services.roadmap_service import RoadmapGeneratorService

router = APIRouter(prefix="/roadmap", tags=["roadmap"])
service = RoadmapGeneratorService()


@router.post("/generate", response_model=GenerateRoadmapResponse)
def generate_roadmap(
    payload: GenerateRoadmapRequest,
    user: dict = Depends(require_roles("learner", "admin")),
) -> GenerateRoadmapResponse:
    ensure_subject(user, payload.user_id)
    return service.generate(payload)
