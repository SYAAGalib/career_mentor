from pydantic import BaseModel, Field
from typing import List, Optional


class GenerateRoadmapRequest(BaseModel):
    user_id: str
    career_goal: str
    prior_knowledge: List[str] = Field(default_factory=list)
    mastered_topics: List[str] = Field(default_factory=list)


class TopicBlock(BaseModel):
    id: str
    title: str
    section: str
    branch: str
    locked: bool = True


class GenerateRoadmapResponse(BaseModel):
    career_path: str
    lock_days: int
    sections: List[str]
    topics: List[TopicBlock]


class SkillValidationRequest(BaseModel):
    user_id: str
    topic_id: str
    score: int


class SkillValidationResponse(BaseModel):
    passed: bool
    score: int
    required_score: int = 80


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer_index: int


class QuizGenerationResponse(BaseModel):
    topic_id: str
    questions: List[QuizQuestion]


class MentorRequest(BaseModel):
    user_id: str
    persona: str
    emotion: str
    context: str


class MentorResponse(BaseModel):
    message: str


class ProgressUpdateRequest(BaseModel):
    user_id: str
    topic_id: str
    completed: bool


class ProgressStateResponse(BaseModel):
    user_id: str
    completion_ratio: float
    pivot_tokens: int
    can_pivot: bool


class LeaderboardEntry(BaseModel):
    user_id: str
    completion_ratio: float
    pivot_tokens: int


class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]


class ResumeBuildRequest(BaseModel):
    user_id: str
    target_role: str
    completed_milestones: List[str] = Field(default_factory=list)


class ResumeBuildResponse(BaseModel):
    markdown_resume: str
    html_resume: str


class SpotlightResponse(BaseModel):
    items: List[str]


class SimulationsResponse(BaseModel):
    items: List[str]


class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str = "learner"


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str


class ExamSubmitRequest(BaseModel):
    user_id: str
    section: str
    score: int


class ExamSubmitResponse(BaseModel):
    passed: bool
    score: int
    cooldown_until: Optional[str] = None
