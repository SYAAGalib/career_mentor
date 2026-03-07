from ..schemas import MentorRequest, MentorResponse
from .llm_service import LLMService


class MentorEngineService:
    def __init__(self) -> None:
        self._llm = LLMService()

    def respond(self, req: MentorRequest) -> MentorResponse:
        tone = {
            "wiseElder": "Build depth before speed.",
            "careerCoach": "Ship measurable progress this week.",
            "creativeGuide": "Explore boldly, validate quickly.",
        }.get(req.persona, "Keep moving with intention.")

        emotion_support = {
            "focused": "Your focus is strong.",
            "confused": "Break this into smaller milestones.",
            "stressed": "Take a short pause and reset.",
            "motivated": "Use this momentum on the hardest task.",
        }.get(req.emotion, "Stay consistent.")

        local_message = f"{tone} {emotion_support} Context: {req.context}"
        ai_message = self._llm.mentor_reply(local_message)
        message = local_message if "unavailable" in ai_message.lower() else ai_message

        return MentorResponse(message=message)
