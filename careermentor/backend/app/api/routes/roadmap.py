from fastapi import APIRouter
from ...schemas import GenerateRoadmapRequest, GenerateRoadmapResponse
from ...services.roadmap_service import RoadmapGeneratorService

router = APIRouter(prefix="/roadmap", tags=["roadmap"])
service = RoadmapGeneratorService()


@router.post("/generate", response_model=GenerateRoadmapResponse)
def generate_roadmap(payload: GenerateRoadmapRequest) -> GenerateRoadmapResponse:
    return service.generate(payload)
