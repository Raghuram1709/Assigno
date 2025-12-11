# Assigno

Monorepo for the Assigno full-stack task management application.

- Frontend: `Assigno_Frontend/`
- Backend: `Assigno_Backend/`

This README covers quickstart, environment variables, project structure, API overview, development commands, and deployment notes.

---

## Quickstart (development)

**Prerequisites**
- Node.js >= 16
- npm, yarn, or pnpm
- MongoDB (local or cloud) for backend

**From repo root**
```bash
# 1. Install dependencies for both projects (run in each folder separately)
cd Assigno_Backend
npm install

cd ../Assigno_Frontend
npm install

# 2. Add environment variables (see .env.example files in each folder)
# 3. Start backend and frontend (in separate terminals)
# Backend
cd Assigno_Backend
npm run dev

# Frontend
cd ../Assigno_Frontend
npm run dev
