# Timesheet Web Application

A full-stack timesheet management app built with **Angular 21** (frontend) and **NestJS** (backend), using **JSON file storage** and **Clerk** authentication with an automatic **Mock Mode** fallback.

---

## Project Structure

```
timesheet-app/
├── backend/       — NestJS REST API
│   ├── src/
│   │   ├── auth/          Auth guard (Clerk + Mock)
│   │   ├── users/         User CRUD
│   │   ├── timesheets/    Timesheet entries + weekly submit
│   │   ├── summaries/     Day/week/admin dashboard summaries
│   │   ├── metrics/       API usage & validation metrics
│   │   ├── reports/       CSV + PDF export
│   │   ├── validation/    Business rule enforcement
│   │   └── storage/       fs/promises JSON persistence
│   └── data/              JSON data files (auto-created)
└── frontend/      — Angular 21 SPA
    └── src/app/
        ├── core/          Models, services, auth
        ├── shared/        Sidebar, topbar, shell layout, chips
        └── features/
            ├── auth/      Login page
            ├── employee/  Weekly grid + History
            └── admin/     Dashboard + Reports + Metrics
```

---

## Business Rules Enforced

| Rule                | Detail                                            |
| ------------------- | ------------------------------------------------- |
| Min On-Site per day | At least **8** employees must be on-site          |
| WFH weekly cap      | Max **3 WFH days** per employee per week          |
| No duplicates       | One entry per user per day                        |
| Structured errors   | All violations return `{ code, message }` objects |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### 1 — Backend

```bash
cd backend
npm install

# Seed 22 users + sample timesheet data
npm run seed

# Start dev server (port 3000)
npm run start:dev
```

The API will be available at `http://localhost:3000/api`.

### 2 — Frontend

```bash
cd frontend
npm install

# Start dev server (port 4200, proxies /api → :3000)
npm start
```

Open `http://localhost:4200` in your browser.

---

## Authentication

### Mock Mode (default — no setup required)

When `CLERK_SECRET_KEY` is **not set** in the backend environment, the app runs in Mock Mode automatically:

- The login page shows 3 pre-defined users (1 admin, 2 employees)
- Select any user to continue — no credentials needed
- The `x-mock-user-id` header is injected into all API requests

### Clerk Mode (production)

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Copy `.env.example` → `.env` in `backend/`
3. Fill in `CLERK_SECRET_KEY`
4. Restart the backend

---

## API Endpoints

| Method | Endpoint                      | Description                               |
| ------ | ----------------------------- | ----------------------------------------- |
| GET    | `/api/users`                  | List all users                            |
| GET    | `/api/users/me`               | Current user                              |
| POST   | `/api/users`                  | Create user                               |
| GET    | `/api/timesheets`             | List entries (filter by userId/date)      |
| GET    | `/api/timesheets/week`        | Entries for a user's week                 |
| GET    | `/api/timesheets/wfh-count`   | WFH usage for a week                      |
| POST   | `/api/timesheets`             | Submit single entry                       |
| POST   | `/api/timesheets/submit-week` | Submit full week (partial errors allowed) |
| DELETE | `/api/timesheets/:id`         | Delete entry                              |
| GET    | `/api/summaries/day`          | Day summary with violation check          |
| GET    | `/api/summaries/week`         | Week summary                              |
| GET    | `/api/summaries/admin`        | Admin dashboard data (date range)         |
| GET    | `/api/metrics`                | API + validation metrics                  |
| GET    | `/api/reports/csv`            | Download CSV report                       |
| GET    | `/api/reports/pdf`            | Download PDF report                       |

---

## Status Color Reference

| Status  | Color     |
| ------- | --------- |
| On-Site | 🟢 Green  |
| WFH     | 🔵 Blue   |
| Leave   | 🟠 Orange |

---

## Tech Stack

| Layer      | Technology                                       |
| ---------- | ------------------------------------------------ |
| Frontend   | Angular 21, Signals, SCSS, standalone components |
| Backend    | NestJS 10, TypeScript                            |
| Storage    | JSON files via `fs/promises`                     |
| Auth       | Clerk / Mock Mode fallback                       |
| PDF        | PDFKit                                           |
| CSV        | csv-stringify                                    |
| Date utils | date-fns                                         |
