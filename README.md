# 🚀 SkillBridge - AI-Powered Career Pathway & Skill-Gap Analyzer

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1+-000000.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.6%20Flash-4285F4.svg?style=flat&logo=google&logoColor=white)](https://ai.google.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4.svg?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**SkillBridge** is an enterprise-grade, end-to-end career transition platform that analyzes developer resumes against industry standards, diagnoses specific technical skill gaps, generates step-by-step personalized learning roadmaps, surfaces real-time live job postings via Jooble, and trains candidates with company-targeted DSA interview radars.

---

## ✨ Key Features

### 1. 🔍 AI Skill Gap Analysis
- Upload any PDF resume or paste raw text.
- Choose from 18+ predefined career tracks or type any custom target role.
- Powered by **Google Gemini** structured output engine with mathematical match scores (0-100), detected strengths, and actionable gap analysis.

### 2. 🗺️ Dynamic Week-by-Week Learning Roadmap
- Custom milestone timeline with progressive skill acquisition checkpoints.
- Curated high-impact learning resources, course recommendations, and practical project ideas for each gap.

### 3. 💼 Live Jooble Job Search Engine
- Real-time job matching directly querying the Jooble Job Search API.
- Strict 4-second timeout with regex HTML sanitization and resilient mock fallback.
- Filter by target keyword/role and location (Remote / On-site).

### 4. 🎯 Company-Targeted DSA Interview Radar
- 26 high-frequency algorithmic interview problems across **Google**, **Amazon**, **Microsoft**, **Meta**, **Uber**, and **Netflix**.
- Filter by company and difficulty (Easy, Medium, Hard).
- Complete with core design patterns and direct links to solve on LeetCode.

### 5. 🗄️ Supabase Cloud Persistence
- Analyses and candidate pathways are securely stored in PostgreSQL via Supabase with automatic JSON payload validation.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React.
- **Backend**: FastAPI, Python 3.12+, Pydantic v2, Uvicorn, httpx, PyPDF2.
- **AI / LLM**: Google Gemini (`gemini-3.6-flash`).
- **Database**: Supabase (PostgreSQL).
- **External APIs**: Jooble Job Search API.

---

## 📁 Repository Structure

```text
malla-reddy-devert/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/          # API endpoints (analyze, jobs, dsa, demo)
│   │   ├── core/                # Configuration and environment loaders
│   │   ├── data/                # DSA interview bank (26 curated problems)
│   │   ├── db/                  # Supabase client singleton
│   │   ├── schemas/             # Pydantic models (analysis, jobs, dsa)
│   │   ├── services/            # Gemini AI, Jooble client, PDF extractor
│   │   └── main.py              # FastAPI application entrypoint
│   ├── test_connections.py     # Automated external connectivity test suite
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router root & page layout
│   │   ├── components/          # Modular UI components (Tabs, Navbar, Upload)
│   │   └── lib/                 # Types and API client utilities
│   ├── package.json             # Node dependencies
│   └── .env.example             # Frontend environment template
├── supabase/
│   └── schema.sql               # PostgreSQL schema definition
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GEMINI_API_KEY, SUPABASE credentials, and JOOBLE_API_KEY

# Run automated diagnostic checks
python test_connections.py

# Start backend server
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local

npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security
- All sensitive API keys (`GEMINI_API_KEY`, `SUPABASE_SECRET_KEY`, `JOOBLE_API_KEY`) are managed via environment variables and strictly excluded by `.gitignore`.
