
# VedaAI — AI Assessment Creator

A production-ready, full-stack AI-powered assessment creation platform for teachers.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS + Zustand |
| Backend | Spring Boot 3.3 + Java 21 |
| AI | Spring AI + OpenAI GPT-4o |
| Database | MongoDB |
| Cache | Redis |
| Queue | RabbitMQ |
| Real-time | WebSocket (STOMP over SockJS) |
| Auth | JWT (jjwt) |
| PDF | OpenPDF (LibrePDF) |

---

## Project Structure

```
vedaai/
├── backend/          Spring Boot application
├── frontend/         Next.js application
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Docker)

### Prerequisites
- Docker + Docker Compose
- An OpenAI API key

### 1. Set environment variables

```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 2. Run everything

```bash
OPENAI_API_KEY=sk-xxx docker-compose up -d
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **RabbitMQ UI**: http://localhost:15672 (guest / guest)

---

## Local Development

### Backend

```bash
cd backend

# Requires Java 21 + Maven

# Start MongoDB, Redis, RabbitMQ (or use Docker):
docker-compose up -d mongodb redis rabbitmq

# Set env vars
export OPENAI_API_KEY=sk-xxx
export MONGODB_URI=mongodb://localhost:27017/vedaai
export REDIS_HOST=localhost
export RABBITMQ_HOST=localhost

# Run
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install

cp .env.local.example .env.local
# Edit .env.local if needed

npm run dev
# Runs on http://localhost:3000
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/signin` | Login → JWT |

### Assignments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/assignments` | Get my assignments |
| POST | `/api/assignments` | Create assignment |
| GET | `/api/assignments/:id` | Get by ID |
| POST | `/api/assignments/:id/generate` | Trigger AI generation |
| POST | `/api/assignments/:id/refine` | Refine with prompt |
| GET | `/api/assignments/:id/download` | Download as PDF |
| DELETE | `/api/assignments/:id` | Delete |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/jobs/:assignmentId` | Get job status |

### WebSocket
- Connect: `ws://localhost:8080/ws` (SockJS)
- Subscribe: `/topic/job/{jobId}` for live progress updates

---

## Key Design Decisions

1. **TestRunner removed** — the original codebase ran on every startup inserting dummy data. Removed.
2. **Teacher-scoped queries** — `GET /api/assignments` returns only the authenticated teacher's assignments (was returning all teachers' data).
3. **AssignmentResponse enriched** — added `dueDate`, `subject`, `standardClass`, `timeAllowed`, `jobId` so the frontend can display cards without extra fetches.
4. **JWT retained** — the original codebase had JWT; it's kept because the app has user accounts and needs auth.
5. **RabbitMQ** — kept as-is (matches original backend choice, equivalent to BullMQ in Node.js stacks).
6. **Security** — all assignment/group/library endpoints verify the authenticated user owns the resource.

---

## Environment Variables

### Backend (`application.yml` / env)
| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | — | **Required** OpenAI key |
| `MONGODB_URI` | `mongodb://localhost:27017/vedaai` | MongoDB connection |
| `REDIS_HOST` | `localhost` | Redis host |
| `RABBITMQ_HOST` | `localhost` | RabbitMQ host |
| `JWT_SECRET` | (default in yml) | Change in production! |

### Frontend (`.env.local`)
| Variable | Default |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` |
| `NEXT_PUBLIC_WS_URL` | `http://localhost:8080/ws` |
=======
# Paper-Craft-AI
AI question paper Generator
>>>>>>> 6ed7af80b07209d34826532c6fc395fafb2d4efc
