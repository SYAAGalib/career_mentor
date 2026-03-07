from fastapi import APIRouter, Depends
from ...schemas import LeaderboardResponse, ProgressUpdateRequest, ProgressStateResponse
from ...security import ensure_subject, require_roles
from ...services.progress_tracker_service import ProgressTrackerService

router = APIRouter(prefix="/progress", tags=["progress"])
service = ProgressTrackerService()


@router.get("/leaderboard", response_model=LeaderboardResponse)
def leaderboard(
    limit: int = 10,
    user: dict = Depends(require_roles("learner", "admin")),
) -> LeaderboardResponse:
    return service.leaderboard(limit=limit)


@router.post("/update", response_model=ProgressStateResponse)
def update_progress(
    payload: ProgressUpdateRequest,
    user: dict = Depends(require_roles("learner", "admin")),
) -> ProgressStateResponse:
    ensure_subject(user, payload.user_id)
    return service.update(payload)
