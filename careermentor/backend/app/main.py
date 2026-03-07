from fastapi import FastAPI

from .api.routes.roadmap import router as roadmap_router
from .api.routes.validation import router as validation_router
from .api.routes.mentor import router as mentor_router
from .api.routes.progress import router as progress_router
from .api.routes.resume import router as resume_router
from .api.routes.content import router as content_router
from .api.routes.auth import router as auth_router
from .api.routes.exams import router as exams_router
from .db import Base, engine
from . import models  # noqa: F401

app = FastAPI(title="CareerMentor AI API", version="1.0.0")


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(roadmap_router)
app.include_router(validation_router)
app.include_router(mentor_router)
app.include_router(progress_router)
app.include_router(resume_router)
app.include_router(content_router)
app.include_router(auth_router)
app.include_router(exams_router)
