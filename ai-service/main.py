from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume, skillgap

app = FastAPI(title="Career Copilot AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)
app.include_router(skillgap.router)

@app.get("/health")
def health():
    return {"status": "ok"}
