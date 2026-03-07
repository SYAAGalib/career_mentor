from fastapi import APIRouter

from ...schemas import SimulationsResponse, SpotlightResponse
from ...services.content_service import ContentService

router = APIRouter(prefix="/content", tags=["content"])
service = ContentService()


@router.get("/spotlight", response_model=SpotlightResponse)
def spotlight() -> SpotlightResponse:
    return service.bangladesh_spotlight()


@router.get("/simulations", response_model=SimulationsResponse)
def simulations(career_path: str = "") -> SimulationsResponse:
    return service.simulations(career_path)
