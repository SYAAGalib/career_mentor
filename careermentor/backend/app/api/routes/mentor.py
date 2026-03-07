from fastapi import APIRouter, Depends
from ...schemas import MentorRequest, MentorResponse
from ...security import ensure_subject, require_roles
from ...services.mentor_engine_service import MentorEngineService

router = APIRouter(prefix="/mentor", tags=["mentor"])
service = MentorEngineService()


@router.post("/reply", response_model=MentorResponse)
def mentor_reply(
    payload: MentorRequest,
    user: dict = Depends(require_roles("learner", "admin")),
) -> MentorResponse:
    ensure_subject(user, payload.user_id)
    return service.respond(payload)
