from fastapi import APIRouter, Depends

from ...schemas import SimulationsResponse, SpotlightResponse
from ...security import require_roles
from ...services.content_service import ContentService

router = APIRouter(prefix="/content", tags=["content"])
service = ContentService()


@router.get("/spotlight", response_model=SpotlightResponse)
def spotlight(
    user: dict = Depends(require_roles("learner", "admin")),
) -> SpotlightResponse:
    return service.bangladesh_spotlight()


@router.get("/simulations", response_model=SimulationsResponse)
def simulations(
    career_path: str = "",
    user: dict = Depends(require_roles("learner", "admin")),
) -> SimulationsResponse:
    return service.simulations(career_path)
