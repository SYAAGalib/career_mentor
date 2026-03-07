from app.services.roadmap_service import RoadmapGeneratorService
from app.services.skill_validation_service import SkillValidationService
from app.schemas import GenerateRoadmapRequest, SkillValidationRequest


def test_roadmap_generation_returns_topics():
    service = RoadmapGeneratorService()
    result = service.generate(
        GenerateRoadmapRequest(
            user_id="u1",
            career_goal="Data science engineer",
            prior_knowledge=["python"],
            mastered_topics=["ds_py"],
        )
    )
    assert result.career_path == "Data Science"
    assert len(result.topics) > 0


def test_validation_pass_fail():
    service = SkillValidationService()
    passed = service.evaluate(SkillValidationRequest(user_id="u1", topic_id="t1", score=85))
    failed = service.evaluate(SkillValidationRequest(user_id="u1", topic_id="t1", score=50))

    assert passed.passed is True
    assert failed.passed is False
