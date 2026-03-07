from sqlalchemy import select

from ..db import SessionLocal
from ..models import UserProgress, UserStats
from ..schemas import (
    LeaderboardEntry,
    LeaderboardResponse,
    ProgressUpdateRequest,
    ProgressStateResponse,
)


class ProgressTrackerService:
    TOTAL_TOPICS = 12

    def update(self, req: ProgressUpdateRequest) -> ProgressStateResponse:
        with SessionLocal() as db:
            stmt = select(UserProgress).where(
                UserProgress.user_id == req.user_id,
                UserProgress.topic_id == req.topic_id,
            )
            record = db.execute(stmt).scalar_one_or_none()

            if record is None:
                record = UserProgress(
                    user_id=req.user_id,
                    topic_id=req.topic_id,
                    completed=req.completed,
                )
                db.add(record)
            else:
                record.completed = req.completed

            completed_count = (
                db.query(UserProgress)
                .filter(
                    UserProgress.user_id == req.user_id,
                    UserProgress.completed.is_(True),
                )
                .count()
            )
            ratio = completed_count / max(self.TOTAL_TOPICS, 1)
            pivot_tokens = completed_count // 4

            stats = db.get(UserStats, req.user_id)
            if stats is None:
                stats = UserStats(
                    user_id=req.user_id,
                    completion_ratio=ratio,
                    pivot_tokens=pivot_tokens,
                )
                db.add(stats)
            else:
                stats.completion_ratio = ratio
                stats.pivot_tokens = pivot_tokens

            db.commit()

            return ProgressStateResponse(
                user_id=req.user_id,
                completion_ratio=ratio,
                pivot_tokens=pivot_tokens,
                can_pivot=(ratio >= 0.8 or pivot_tokens > 0),
            )

    def leaderboard(self, limit: int = 10) -> LeaderboardResponse:
        with SessionLocal() as db:
            rows = (
                db.query(UserStats)
                .order_by(UserStats.completion_ratio.desc(), UserStats.pivot_tokens.desc())
                .limit(limit)
                .all()
            )
            return LeaderboardResponse(
                entries=[
                    LeaderboardEntry(
                        user_id=row.user_id,
                        completion_ratio=row.completion_ratio,
                        pivot_tokens=row.pivot_tokens,
                    )
                    for row in rows
                ]
            )
