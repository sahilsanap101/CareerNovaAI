# PATHFORGE — AI-Powered Career Navigation Platform

> Forge your engineering career with AI.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=nodedotjs)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blueviolet?logo=prisma)](https://www.prisma.io)

---

## 🗺️ Project Structure

```
PATHFORGE/
├── apps/
│   ├── api/              # Express + Prisma backend
│   │   ├── prisma/       # Schema + migrations + seed
│   │   └── src/
│   │       ├── config/   # env, database, mail
│   │       ├── controllers/
│   │       ├── events/   # EventBus + listeners
│   │       ├── middleware/
│   │       ├── repositories/
│   │       ├── routes/
│   │       ├── services/
│   │       └── utils/
│   └── web/              # React + Vite frontend
│       └── src/
│           ├── api/      # Axios + typed API clients
│           ├── components/
│           ├── hooks/
│           ├── layouts/
│           ├── pages/
│           ├── router/
│           ├── store/    # Zustand stores
│           └── styles/
└── packages/
    ├── shared-enums/     # Enums shared across apps
    ├── shared-constants/ # Routes, error codes, etc.
    ├── shared-types/     # TypeScript interfaces
    ├── shared-zod/       # Zod validation schemas
    ├── shared-utils/     # Pure utility functions
    └── shared-ui/        # (Placeholder for Phase 2+)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- A Supabase Project (Managed PostgreSQL & Storage)
- npm 10+

### 1. Clone & install
```bash
git clone https://github.com/your-org/pathforge.git
cd PATHFORGE
npm install
```

### 2. Configure environment
```bash
# Backend (.env)
cp apps/api/.env.example apps/api/.env
# Set DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_ANON_KEY, etc. in apps/api/.env

# Frontend (.env)
cp apps/web/.env.example apps/web/.env
```

### 3. Supabase Storage Buckets
Create the following buckets in your Supabase Dashboard under **Storage**:
- `profile-images` (Public)
- `resumes` (Private / Authenticated)
- `certificates` (Private / Authenticated)
- `projects` (Public)

### 4. Database Setup & Migrations
```bash
npm run db:migrate --workspace=apps/api
npm run db:seed --workspace=apps/api
```

### 5. Start development
```bash
# Terminal 1 — Backend
npm run dev --workspace=apps/api

# Terminal 2 — Frontend
npm run dev --workspace=apps/web
```

- **API**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **Health Check**: http://localhost:5000/api/v1/health

---

## 🐳 Docker Development

```bash
# Start all services (PostgreSQL + Redis + API)
docker-compose up -d

# Run migrations
docker-compose exec api npm run db:migrate

# Seed database
docker-compose exec api npm run db:seed
```

---

## 🔑 Development Credentials (after seed)

| Role    | Email                    | Password       |
|---------|--------------------------|----------------|
| Admin   | admin@pathforge.dev      | Admin@1234     |
| Student | student@pathforge.dev    | Student@1234   |

---

## 📡 API Reference

### Auth Endpoints (`/api/v1/auth`)
| Method | Endpoint            | Description           |
|--------|---------------------|-----------------------|
| POST   | /register           | Create account        |
| POST   | /login              | Login                 |
| POST   | /logout             | Logout (auth)         |
| POST   | /refresh-token      | Refresh access token  |
| POST   | /forgot-password    | Request reset email   |
| POST   | /reset-password     | Reset password        |
| GET    | /verify-email       | Verify email address  |

### User Endpoints (`/api/v1/users`) — All require Auth
| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| GET    | /me                | Get current user   |
| PUT    | /profile           | Update profile     |
| PUT    | /preferences       | Update preferences |
| PUT    | /change-password   | Change password    |
| DELETE | /delete            | Delete account     |

### Response Envelope
All responses follow the standardized shape:
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {},
  "meta": null,
  "errors": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🧪 Testing

```bash
# Backend tests
npm test --workspace=apps/api

# Frontend tests
npm test --workspace=apps/web

# Coverage
npm run test:coverage --workspace=apps/api
```

---

## 🏗️ Phase Roadmap

| Phase | Feature                        | Status       |
|-------|--------------------------------|--------------|
| 1     | Foundation, Auth, Profile      | ✅ Complete  |
| 2     | BYSER Career Recommendation    | 🔄 Planned   |
| 3     | Roadmap Generator              | 🔄 Planned   |
| 4     | Resume Analysis                | 🔄 Planned   |
| 5     | GitHub Analysis                | 🔄 Planned   |
| 6     | AI Career Mentor               | 🔄 Planned   |
| 7     | Skill Gap Dashboard            | 🔄 Planned   |
| 8     | Analytics & Research Dashboard | 🔄 Planned   |

---

## 🔐 Security Architecture

- **Access Token**: Memory (Zustand) — never in localStorage
- **Refresh Token**: `httpOnly` cookie — XSS-safe
- **Password**: bcrypt (12 rounds)
- **Rate Limiting**: Auth endpoints: 10/15min | Global: 200/15min
- **Helmet**: Secure HTTP headers
- **CORS**: Configured to frontend origin only
- **Audit Log**: Every significant action is logged with IP and metadata

---

## 📦 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| API       | Node.js 20, Express 5, TypeScript   |
| ORM       | Prisma 5, PostgreSQL 16             |
| Auth      | JWT (access + refresh rotation)     |
| Validation| Zod (shared schemas)                |
| Frontend  | React 18, Vite 5, TypeScript        |
| Styling   | Tailwind CSS 3                      |
| State     | Zustand 5                           |
| Server    | TanStack Query 5                    |
| Logging   | Winston + Morgan                    |
| Testing   | Jest (API), Vitest + RTL (Web)      |

---

## 📜 License

MIT © PATHFORGE Research Team
