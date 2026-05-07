import os, json, tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from groq import Groq
from parsers.resume_parser import extract_text
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@router.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    suffix = os.path.splitext(resume.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await resume.read())
        tmp_path = tmp.name

    try:
        resume_text = extract_text(tmp_path)
    finally:
        os.unlink(tmp_path)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from resume")

    prompt = f"""
You are an expert ATS resume analyzer.

RESUME:
{resume_text[:3000]}

JOB DESCRIPTION:
{job_description[:2000]}

Analyze the resume against the job description and respond ONLY with valid JSON in this exact format:
{{
  "matchScore": <integer 0-100>,
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": "2-3 specific improvement tips as a single string",
  "overallFeedback": "One sentence summary of fit"
}}
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=800
    )

    raw = response.choices[0].message.content.strip()
    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid response")

    return result
