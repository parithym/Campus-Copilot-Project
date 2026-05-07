# Career Copilot — AI-First Placement Management Platform

A full-stack placement management system with AI-powered resume analysis, skill gap detection, and Kanban-based application tracking.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **AI Service**: Python + FastAPI + OpenAI API
- **Auth**: JWT (access + refresh tokens)

## Project Structure
```
career-copilot/
├── backend/          # Node.js Express API
├── frontend/         # React Vite app
├── ai-service/       # Python FastAPI AI microservice
└── README.md
```

## Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- OpenAI API key

---

## Setup Instructions

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# AI Service
cd ../ai-service
pip install -r requirements.txt
```

### 2. Environment variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/career-copilot
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

**ai-service/.env**
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run all three services

Open 3 terminals:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - AI Service
cd ai-service && uvicorn main:app --reload --port 8000
```

### 4. Open the app
Visit: http://localhost:5173

---

## Default Accounts (after seeding)

| Role    | Email                | Password   |
|---------|----------------------|------------|
| Admin   | admin@copilot.com    | Admin@123  |
| TPO     | tpo@copilot.com      | Tpo@123    |
| Student | student@copilot.com  | Student@123|

Seed: `cd backend && npm run seed`

---

## Features
- JWT auth with role-based access (Student / TPO / Admin)
- Student profile with skills and target role
- Kanban placement tracker (drag-and-drop)
- Resume + JD upload with AI match scoring
- Missing keyword identification
- Skill gap radar chart
- TPO monitoring dashboard
- Admin user management
