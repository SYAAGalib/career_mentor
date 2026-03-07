from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from datetime import datetime

from .db import Base


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(120), index=True, nullable=False)
    topic_id = Column(String(120), nullable=False)
    completed = Column(Boolean, default=False)


class UserStats(Base):
    __tablename__ = "user_stats"

    user_id = Column(String(120), primary_key=True, index=True)
    completion_ratio = Column(Float, default=0.0)
    pivot_tokens = Column(Integer, default=0)


class UserAccount(Base):
    __tablename__ = "user_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(120), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="learner", nullable=False)


class SectionExamAttempt(Base):
    __tablename__ = "section_exam_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(120), index=True, nullable=False)
    section = Column(String(120), index=True, nullable=False)
    score = Column(Integer, nullable=False)
    passed = Column(Boolean, default=False)
    attempted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    cooldown_until = Column(DateTime, nullable=True)
