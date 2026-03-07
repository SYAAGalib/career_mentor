from fastapi import APIRouter
from ...schemas import LeaderboardResponse, ProgressUpdateRequest, ProgressStateResponse
from ...services.progress_tracker_service import ProgressTrackerService

router = APIRouter(prefix="/progress", tags=["progress"])
service = ProgressTrackerService()


@router.get("/leaderboard", response_model=LeaderboardResponse)
def leaderboard(limit: int = 10) -> LeaderboardResponse:
    return service.leaderboard(limit=limit)


@router.post("/update", response_model=ProgressStateResponse)
def update_progress(payload: ProgressUpdateRequest) -> ProgressStateResponse:
    return service.update(payload)
