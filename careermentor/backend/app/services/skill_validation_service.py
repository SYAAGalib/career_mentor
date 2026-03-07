from ..schemas import (
    QuizGenerationResponse,
    QuizQuestion,
    SkillValidationRequest,
    SkillValidationResponse,
)
from .llm_service import LLMService


class SkillValidationService:
    REQUIRED_SCORE = 80

    def __init__(self) -> None:
        self._llm = LLMService()

    def generate_quiz(self, topic_id: str) -> QuizGenerationResponse:
        base = topic_id.replace("_", " ").title()
        ai_questions = self._llm.generate_quiz_questions(base)
        if len(ai_questions) >= 3:
            questions = [
                QuizQuestion(
                    question=ai_questions[0],
                    options=[
                        "Best practice",
                        "Weak practice",
                        "Unrelated",
                        "Skip",
                    ],
                    answer_index=0,
                ),
                QuizQuestion(
                    question=ai_questions[1],
                    options=[
                        "Practical validation",
                        "No validation",
                        "Guessing",
                        "Ignore",
                    ],
                    answer_index=0,
                ),
                QuizQuestion(
                    question=ai_questions[2],
                    options=[
                        "Review and retry",
                        "Force unlock",
                        "Abandon",
                        "Random",
                    ],
                    answer_index=0,
                ),
            ]
            return QuizGenerationResponse(topic_id=topic_id, questions=questions)

        questions = [
            QuizQuestion(
                question=f"What is the primary outcome of {base}?",
                options=[
                    "Clear understanding and practical application",
                    "Only theory memorization",
                    "No measurable skill gain",
                    "Unrelated domain knowledge",
                ],
                answer_index=0,
            ),
            QuizQuestion(
                question=f"Which approach is best to validate mastery in {base}?",
                options=[
                    "Hands-on task and reflection",
                    "Skipping all exercises",
                    "Random guessing",
                    "Ignoring feedback",
                ],
                answer_index=0,
            ),
            QuizQuestion(
                question=f"What should you do if score is below 80% in {base}?",
                options=[
                    "Review weak areas and retry after cooldown",
                    "Force unlock next branch",
                    "Ignore mistakes",
                    "Switch path immediately",
                ],
                answer_index=0,
            ),
        ]
        return QuizGenerationResponse(topic_id=topic_id, questions=questions)

    def evaluate(self, req: SkillValidationRequest) -> SkillValidationResponse:
        passed = req.score >= self.REQUIRED_SCORE
        return SkillValidationResponse(passed=passed, score=req.score)
