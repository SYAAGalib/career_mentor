from ..schemas import GenerateRoadmapRequest, GenerateRoadmapResponse, TopicBlock
from ..topic_catalog import TOPIC_CATALOG, infer_path
from .llm_service import LLMService


class RoadmapGeneratorService:
    def __init__(self) -> None:
        self._llm = LLMService()

    def generate(self, req: GenerateRoadmapRequest) -> GenerateRoadmapResponse:
        career_path = self._llm.career_path_suggestion(req.career_goal) or infer_path(
            req.career_goal
        )
        modules = TOPIC_CATALOG.get(career_path, TOPIC_CATALOG["Software Engineering"])

        mastered = set(req.mastered_topics)
        topics: list[TopicBlock] = []

        for section, blocks in modules.items():
            for block in blocks:
                if block["id"] in mastered:
                    continue
                is_foundation = section == "Foundations"
                topics.append(
                    TopicBlock(
                        id=block["id"],
                        title=block["title"],
                        section=section,
                        branch=block["branch"],
                        locked=not is_foundation,
                    )
                )

        return GenerateRoadmapResponse(
            career_path=career_path,
            lock_days=45,
            sections=list(modules.keys()),
            topics=topics,
        )
