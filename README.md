# LMS Application Monorepo

This repository contains both the **Frontend** (Next.js 14) and **Backend** (Python FastAPI) services for the LMS application.

---

## 📁 Repository Structure

```
LMS_PU/
├── backend/          # Python FastAPI service (Authentication, Users CRUD, Metrics)
│   ├── app/          # FastAPI application modules
│   ├── seed.py       # Database seed script
│   ├── requirements.txt # Python dependencies
│   └── README.md     # Backend setup instructions
└── frontend/         # Next.js 14 React frontend
    ├── src/          # Next.js App Router pages and components
    ├── prisma/       # Prisma schema & JavaScript database configuration
    ├── package.json  # Node.js dependencies
    └── README.md     # Frontend setup instructions
```

---

## ⚡ Quick Start Guide

### 1. Run Python FastAPI Backend

```bash
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1    # PowerShell (Windows)
# or: source venv/bin/activate # Linux/Mac

# Run Uvicorn dev server
uvicorn app.main:app --reload --port 8000
```
- API Documentation (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 2. Run Next.js Frontend

```bash
cd frontend

# Run development server
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)
