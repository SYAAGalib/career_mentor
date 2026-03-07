from ..schemas import SimulationsResponse, SpotlightResponse


class ContentService:
    def bangladesh_spotlight(self) -> SpotlightResponse:
        return SpotlightResponse(
            items=[
                "Khulna to Global Product Designer — Case Study",
                "Dhaka Data Analyst to ML Engineer — Interview",
                "Rajshahi Flutter Developer Career Roadmap — Weekly Spotlight",
            ]
        )

    def simulations(self, career_path: str) -> SimulationsResponse:
        path = career_path or "General Career"
        return SimulationsResponse(
            items=[
                f"Day-in-the-life simulation for {path}",
                "Decision drill: prioritize tasks under deadline",
                "Scenario review: present your work to a hiring panel",
            ]
        )
