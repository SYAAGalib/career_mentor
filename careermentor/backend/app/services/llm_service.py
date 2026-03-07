import os
import json
from pathlib import Path
from typing import Optional
from urllib import error, request


class LLMService:
    def __init__(self) -> None:
        self.api_key: Optional[str] = (
            os.getenv("GEMINI_API_KEY")
            or os.getenv("OPENAI_API_KEY")
            or self._load_from_default_file()
        )
        self.model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    def _load_from_default_file(self) -> Optional[str]:
        try:
            root = Path(__file__).resolve().parents[3]
            key_file = root / "default_api_credencial" / "api_key.txt"
            if not key_file.exists():
                return None

            raw = key_file.read_text(encoding="utf-8").strip()
            if not raw:
                return None
            if "=" in raw:
                return raw.split("=", 1)[1].strip()
            return raw
        except Exception:
            return None

    def is_available(self) -> bool:
        return bool(self.api_key)

    def _generate_text(self, prompt: str) -> Optional[str]:
        if not self.is_available():
            return None

        endpoint = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.model}:generateContent?key={self.api_key}"
        )
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                    ]
                }
            ]
        }

        req = request.Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with request.urlopen(req, timeout=7) as response:
                body = response.read().decode("utf-8")
                decoded = json.loads(body)
                candidates = decoded.get("candidates", [])
                if not candidates:
                    return None
                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts:
                    return None
                text = parts[0].get("text")
                return text.strip() if isinstance(text, str) else None
        except (error.URLError, error.HTTPError, TimeoutError, json.JSONDecodeError):
            return None

    def mentor_reply(self, prompt: str) -> str:
        text = self._generate_text(
            "You are a concise career mentor. Give practical guidance in 2-3 short lines.\n"
            f"Context:\n{prompt}"
        )
        if text:
            return text
        return "AI service unavailable. Using local mentor logic."

    def career_path_suggestion(self, goal: str) -> Optional[str]:
        text = self._generate_text(
            "Choose exactly one career path from this list only: "
            "Data Science, Software Engineering, UX Research.\n"
            f"User goal: {goal}\n"
            "Respond with only the selected path."
        )
        if not text:
            return None
        normalized = text.strip().lower()
        if "data science" in normalized:
            return "Data Science"
        if "ux" in normalized:
            return "UX Research"
        if "software" in normalized:
            return "Software Engineering"
        return None

    def generate_quiz_questions(self, topic_name: str) -> list[str]:
        text = self._generate_text(
            "Generate exactly 3 short mastery quiz questions for this topic.\n"
            f"Topic: {topic_name}\n"
            "Return plain text with one question per line and no numbering."
        )
        if not text:
            return []
        return [line.strip() for line in text.splitlines() if line.strip()][:3]

    def improve_resume_markdown(self, markdown: str) -> Optional[str]:
        text = self._generate_text(
            "Improve this resume markdown for clarity and hiring impact while preserving facts.\n"
            "Keep markdown format concise.\n"
            f"Input:\n{markdown}"
        )
        return text
