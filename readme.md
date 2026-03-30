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