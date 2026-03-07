from datetime import datetime, timedelta, timezone
from sqlalchemy import select

from ..db import SessionLocal
from ..models import SectionExamAttempt
from ..schemas import ExamSubmitRequest, ExamSubmitResponse


class ExamService:
    PASS_SCORE = 80
    COOLDOWN_DAYS = 3

    def submit(self, req: ExamSubmitRequest) -> ExamSubmitResponse:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        with SessionLocal() as db:
            latest = db.execute(
                select(SectionExamAttempt)
                .where(
                    SectionExamAttempt.user_id == req.user_id,
                    SectionExamAttempt.section == req.section,
                )
                .order_by(SectionExamAttempt.attempted_at.desc())
            ).scalars().first()

            if latest and latest.cooldown_until and latest.cooldown_until > now:
                return ExamSubmitResponse(
                    passed=False,
                    score=req.score,
                    cooldown_until=latest.cooldown_until.isoformat(),
                )

            passed = req.score >= self.PASS_SCORE
            cooldown = None if passed else now + timedelta(days=self.COOLDOWN_DAYS)

            attempt = SectionExamAttempt(
                user_id=req.user_id,
                section=req.section,
                score=req.score,
                passed=passed,
                cooldown_until=cooldown,
            )
            db.add(attempt)
            db.commit()

            return ExamSubmitResponse(
                passed=passed,
                score=req.score,
                cooldown_until=cooldown.isoformat() if cooldown else None,
            )
