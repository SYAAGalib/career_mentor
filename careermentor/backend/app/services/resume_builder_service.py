from ..schemas import ResumeBuildRequest, ResumeBuildResponse
from .llm_service import LLMService


class ResumeBuilderService:
    def __init__(self) -> None:
        self._llm = LLMService()

    def build(self, req: ResumeBuildRequest) -> ResumeBuildResponse:
        lines = [
            f"# Resume for {req.target_role}",
            "",
            "## CareerMentor Achievements",
            *[f"- {m}" for m in req.completed_milestones],
        ]
        markdown = "\n".join(lines)
        improved = self._llm.improve_resume_markdown(markdown)
        if improved:
            markdown = improved

        html_items = "".join(f"<li>{m}</li>" for m in req.completed_milestones)
        html = (
            f"<h1>Resume for {req.target_role}</h1>"
            f"<h2>CareerMentor Achievements</h2><ul>{html_items}</ul>"
        )

        return ResumeBuildResponse(markdown_resume=markdown, html_resume=html)
