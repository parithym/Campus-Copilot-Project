import os, json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

ROLE_SKILLS = {
    "Software Development Engineer": ["Data Structures", "Algorithms", "System Design", "OOP", "SQL", "Git", "REST APIs", "Problem Solving"],
    "Data Analyst": ["SQL", "Python", "Excel", "Statistics", "Data Visualization", "Tableau", "Power BI", "Pandas"],
    "Machine Learning Engineer": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Mathematics", "Statistics", "MLOps"],
    "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Responsive Design", "Git", "REST APIs"],
    "Backend Developer": ["Node.js", "Python", "SQL", "NoSQL", "REST APIs", "System Design", "Docker", "Git"],
    "DevOps Engineer": ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Git", "Bash Scripting"],
    "Product Manager": ["Product Strategy", "Agile", "User Research", "Data Analysis", "Roadmapping", "Stakeholder Management", "Communication"],
}

class SkillGapRequest(BaseModel):
    skills: List[str]
    target_role: str

@router.post("/skill-gap")
async def skill_gap(req: SkillGapRequest):
    required = ROLE_SKILLS.get(req.target_role, [])

    if not required:
        prompt = f"""
List exactly 8 key technical skills required for a "{req.target_role}" role.
Respond ONLY with a JSON array of strings. Example: ["Skill1", "Skill2"]
"""
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2, max_tokens=200
        )
        try:
            required = json.loads(response.choices[0].message.content.strip())
        except:
            required = ["Communication", "Problem Solving", "Teamwork", "Analytical Thinking"]

    student_skills_lower = [s.lower() for s in req.skills]
    matched = [s for s in required if s.lower() in student_skills_lower]
    missing = [s for s in required if s.lower() not in student_skills_lower]

    radar_data = []
    for skill in required:
        score = 80 if skill.lower() in student_skills_lower else 15
        radar_data.append({"skill": skill, "score": score})

    readiness = round((len(matched) / len(required)) * 100) if required else 0

    return {
        "targetRole": req.target_role,
        "requiredSkills": required,
        "matchedSkills": matched,
        "missingSkills": missing,
        "readinessScore": readiness,
        "radarData": radar_data
    }
