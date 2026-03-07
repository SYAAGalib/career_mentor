TOPIC_CATALOG = {
    "Data Science": {
        "Foundations": [
            {"id": "ds_py", "title": "Python Basics", "branch": "Core"},
            {"id": "ds_stats", "title": "Statistics Fundamentals", "branch": "Core"},
            {"id": "ds_sql", "title": "SQL for Analytics", "branch": "Core"},
        ],
        "Specialization": [
            {"id": "ds_mle", "title": "ML Engineering", "branch": "A"},
            {"id": "ds_da", "title": "Data Analysis", "branch": "B"},
            {"id": "ds_nlp", "title": "NLP", "branch": "C"},
        ],
        "Advanced": [
            {"id": "ds_cap", "title": "Capstone Project", "branch": "A"},
        ],
    },
    "Software Engineering": {
        "Foundations": [
            {"id": "se_prog", "title": "Programming Fundamentals", "branch": "Core"},
            {"id": "se_dsa", "title": "Data Structures & Algorithms", "branch": "Core"},
            {"id": "se_db", "title": "Databases", "branch": "Core"},
        ],
        "Specialization": [
            {"id": "se_backend", "title": "Backend Engineering", "branch": "A"},
            {"id": "se_frontend", "title": "Frontend Engineering", "branch": "B"},
            {"id": "se_mobile", "title": "Mobile Engineering", "branch": "C"},
        ],
        "Advanced": [
            {"id": "se_sys", "title": "System Design", "branch": "A"},
        ],
    },
    "UX Research": {
        "Foundations": [
            {"id": "ux_found", "title": "UX Foundations", "branch": "Core"},
            {"id": "ux_methods", "title": "Research Methods", "branch": "Core"},
            {"id": "ux_data", "title": "User Data Interpretation", "branch": "Core"},
        ],
        "Specialization": [
            {"id": "ux_qual", "title": "Qualitative Research", "branch": "A"},
            {"id": "ux_quant", "title": "Quantitative Research", "branch": "B"},
            {"id": "ux_strategy", "title": "UX Strategy", "branch": "C"},
        ],
        "Advanced": [
            {"id": "ux_port", "title": "Portfolio & Case Studies", "branch": "A"},
        ],
    },
}


def infer_path(goal: str) -> str:
    g = goal.lower()
    if "data" in g or "ml" in g or "ai" in g:
        return "Data Science"
    if "design" in g or "ux" in g:
        return "UX Research"
    if "software" in g or "app" in g or "web" in g:
        return "Software Engineering"
    return "Software Engineering"
