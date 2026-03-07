from fastapi import APIRouter
from ...schemas import MentorRequest, MentorResponse
from ...services.mentor_engine_service import MentorEngineService

router = APIRouter(prefix="/mentor", tags=["mentor"])
service = MentorEngineService()


@router.post("/reply", response_model=MentorResponse)
def mentor_reply(payload: MentorRequest) -> MentorResponse:
    return service.respond(payload)
