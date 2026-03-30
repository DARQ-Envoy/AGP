# Donor Intelligence Dashboard

A full-stack AI-powered dashboard for nonprofit donor analytics, built as part of a forward-deployed engineering assessment.

## 🔗 Live Demo
https://v0-donor-intelligence-dashboard.vercel.app/dashboard

---

## 🧠 Overview

This application enables nonprofit teams to upload donor data and instantly generate actionable insights through a polished executive dashboard and natural language queries.

The goal was to ship a production-ready tool within one day that a VP of Development could confidently use in a live meeting.

---

## ⚙️ Tech Stack

### Frontend
- Next.js (React)
- Axios (API communication)
- Deployed on Vercel

### Backend
- NestJS
- Deployed on Google Cloud Run

### Database & Auth
- Supabase

### AI
- LLM integration via Groq API
- Structured prompt engineering over raw donor data

---

## 🧩 Why These Technologies

**NestJS + Supabase** were chosen for their robustness and speed of development.

- NestJS provides a scalable, modular backend architecture with strong typing and clear separation of concerns.
- Supabase simplifies database management, authentication, and real-time capabilities, allowing rapid iteration without sacrificing structure.

This combination enabled fast delivery while maintaining a production-grade backend design.

---

## 🚀 Features

### 1. CSV Upload & Parsing
- Upload donor CSV (~200 rows)
- Validates and handles malformed data gracefully
- Preview before committing

### 2. Executive Dashboard
- KPI cards: Total Raised, Average Gift, Donor Count
- Visual breakdowns (campaigns, segments, channels)
- Clean UI designed for executive consumption

### 3. Natural Language Query (AI)
- Ask questions like:
  - "Which campaign had the highest average gift?"
  - "Show me lapsed donors"
- Uses structured prompt context (not raw CSV dumping)
- Streams responses to UI

### 4. Authentication
- Login required
- Session-based access
- Protected routes

---

## 🏗️ Architecture

```text
Frontend (Next.js / Vercel)
        ↓
Backend API (NestJS / Cloud Run)
        ↓
Supabase (DB + Auth)
        ↓
LLM (Groq API)



### Architecture Overview

- **Frontend** handles UI and user interaction  
- **Backend** processes data, enforces auth, and constructs AI prompts  
- **Supabase** manages persistence and authentication  
- **AI layer** operates on structured dataset context  

---

### ⚠️ Tradeoffs & Shortcuts

Due to the one-day constraint, some pragmatic decisions were made:

- **Middleware-based route protection was simplified**  
  - Cross-domain cookie limitations (Vercel ↔ Cloud Run) prevented reliable auth checks in middleware  
  - Auth validation is handled via backend instead  
  - Middleware can be revisited with a unified domain setup  

- **Limited caching strategy**  
  - Auth endpoints explicitly disable caching to ensure correctness  

- **Basic error handling in AI layer**  
  - Focus was on correctness and structured prompting over edge-case handling  

---

### ✅ What is Production-Ready

- Modular NestJS backend architecture  
- Supabase integration for auth and persistence  
- Structured AI prompting pipeline  
- Clean, responsive frontend UI  
- End-to-end data flow (upload → insights → AI queries)  

---

### 🚧 What Would Be Improved Next

- Move to a shared domain for proper cookie-based middleware auth  
- Add role-based access control (RBAC)  
- Improve dataset scaling (pagination, aggregation layer)  
- Add background processing for large uploads  
- Enhance AI query reliability with schema validation  
- Add automated tests (unit + integration)  

