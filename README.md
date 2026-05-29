# TriForm — May 2026

**TriForm** is a full-stack triathlon training platform for athletes who want to log workouts, manage athlete profile data, generate structured race-specific training plans, track planned workout completion, and view progress analytics. The project uses a Next.js frontend, a Spring Boot backend, JWT authentication, and a SQLite database.

## Features

- **User Authentication** — Secure registration and login with JWT authentication
- **User Profiles** — Athlete profile setup with height, weight, birthday, metric/imperial unit preference, experience level, weekly training days, max weekday/weekend training hours, and preferred rest day
- **Global App Shell** — Protected app layout with shared sidebar navigation across dashboard, training plan, workout log, progress, and account pages
- **Dashboard** — Protected dashboard with today’s planned workouts, current week planned workouts, missed/completed week snapshot, recent logged workouts, and quick links
- **Workout Tracking** — Create, view, edit, and delete swim, bike, and run workouts
- **Training Plan Generation** — Rule-based training plan generation based on race type and race date
- **Planned Workouts** — Automatically generated planned workouts with discipline, type, target duration, target distance, notes, week number, and completion status
- **Planned Workout Completion** — Planned workouts can be toggled complete/incomplete from both the dashboard and training plan page
- **Auto-Logging from Plans** — Marking an incomplete planned workout complete automatically creates a standard logged workout
- **Duplicate Log Protection** — A planned workout links to the logged workout it created so repeat logging does not create duplicate workout records
- **Missed Workout Detection** — Frontend status logic identifies completed, missed, and upcoming planned workouts based on completion and scheduled date
- **Progress Analytics** — Progress page summarizes logged workouts, weekly volume, discipline totals, completion rate, missed planned workouts, completed planned workouts, and upcoming planned workouts
- **Account Management** — Edit existing athlete profile and training availability information
- **API Integration** — Type-safe frontend/backend communication through shared request and response types
- **Security Controls** — Protected API routes, JWT validation, ownership checks, and CORS support

## Tech Stack

### Frontend

- **Framework:** Next.js 15+ with React
- **Language:** TypeScript
- **Styling:** CSS Modules
- **HTTP Client:** Fetch API with custom helper functions
- **Development Server:** `http://localhost:3000`

### Backend

- **Framework:** Spring Boot 3.5.10
- **Language:** Java 17+
- **Database:** SQLite with Hibernate ORM
- **Authentication:** JWT
- **Build Tool:** Maven
- **Development Server:** `http://localhost:8080`

### Testing

- **Test Framework:** Spring Boot Test
- **API Testing:** MockMvc integration tests
- **Test Database:** H2 in-memory database
- **Current Coverage:** Authentication, profiles, profile training availability fields, workouts, training plans, planned workout completion, auto-logging planned workouts, duplicate log prevention, ownership/security checks, bad request handling, and CORS preflight handling

### Security

- Spring Security configuration for protected routes
- JWT token validation on authenticated endpoints
- BCrypt password hashing
- Custom authorization filter with SecurityContext integration
- CORS configuration for frontend/backend communication
- Ownership checks for workouts, profiles, training plans, and planned workout actions

## Project Structure

```text
TriForm/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── account/         # Account/profile editing page
│   │   │   ├── dashboard/       # Protected training dashboard
│   │   │   ├── log/             # Workout logging page
│   │   │   ├── plan/            # Training plan generation and detail page
│   │   │   ├── profile/         # Initial profile setup page
│   │   │   ├── progress/        # Athlete analytics/progress page
│   │   │   ├── register/        # Registration page
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx         # Login/home page
│   │   ├── components/
│   │   │   ├── AppShell.tsx     # Shared protected app layout
│   │   │   └── AppShell.module.css
│   │   └── lib/
│   │       ├── api-helper.ts    # API client and auth helpers
│   │       └── types.ts         # Shared TypeScript interfaces
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── src/main/java/
│   │   ├── TriForm/             # Application entry point
│   │   ├── config/              # JWT properties, CORS, password hashing
│   │   ├── controllers/         # Auth, profile, workout, and training plan controllers
│   │   ├── dto/                 # Request/response DTOs
│   │   ├── entities/            # JPA entities and enums
│   │   ├── exceptions/          # Custom runtime exceptions
│   │   ├── repositories/        # Spring Data JPA repositories
│   │   ├── security/            # Authorization filter and security config
│   │   └── services/            # Business logic services
│   ├── src/test/java/           # Integration tests
│   ├── .env
│   └── pom.xml
│
└── README.md
```

## Completed

- Full authentication flow with registration, login, JWT generation, and JWT validation
- Frontend login and registration pages
- Automatic routing after login based on profile existence
- Profile creation, retrieval, and updating
- Profile training availability fields: experience level, weekly training days, max weekday hours, max weekend hours, and preferred rest day
- Protected route handling for profile, dashboard, log, plan, progress, and account pages
- Shared global app shell with sidebar navigation
- Workout logging with create, read, update, and delete support
- Workout support for title, discipline, type, date, duration, distance, and notes
- Training plan backend with race goals, training plans, and planned workouts
- Rule-based plan generation for Sprint, Olympic, Half Ironman, and Full Ironman race types
- Plan frontend page for generating, viewing, selecting, deleting, and completing planned workouts
- Plan listing, plan detail retrieval, and plan deletion endpoints
- Planned workout toggle-complete endpoint
- Today and current-week planned workout endpoints for dashboard usage
- Auto-log endpoint that creates a standard workout from a planned workout
- Duplicate log protection through planned workout to logged workout linking
- Frontend missed/upcoming/completed status handling for planned workouts
- Progress analytics frontend with logged workout totals, weekly volume, discipline breakdowns, and planned workout adherence stats
- Ownership checks preventing users from viewing, editing, deleting, completing, or logging another user's data
- Integration test suite covering core backend behavior and newer planned workout/profile behavior
- H2 test database configuration for reliable automated testing

## In Progress

- Frontend styling polish for smaller screen sizes and unusual aspect ratios
- Clearer completed/logged state in UI
- Planned vs actual distance and time comparison
- Dashboard weekly progress snapshots such as `Bike: 23/75 mi`
- Plan generator improvements and AI-assisted plan generation planning

## Next Steps

- Improve responsive UI across dashboard, plan, progress, log, profile, and account pages
- Add a clearer planned workout status model, such as `PLANNED`, `COMPLETED`, `SKIPPED`, `MISSED`, and `LOGGED`
- Add planned vs actual comparisons for logged workouts created from planned workouts
- Add an edit-confirm prompt before auto-logging planned workouts so users can adjust actual distance, duration, and notes before saving
- Add current swim, bike, and run comfort fields to profile data
- Add optional injury status later
- Add backend progress endpoints after frontend analytics stabilize
- Add AI-powered plan generation using profile, availability, progress, and race goal context
- Add AI-assisted plan adaptation for missed workouts after progress and status rules are stable

## Getting Started

### Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.8+

### Running Locally

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

**Backend:**

```bash
cd backend
mvn spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

### Running Tests

From the backend folder:

```bash
mvn clean test
```

To run only the main integration test file:

```bash
mvn clean test -Dtest=TriFormApiIntegrationTest
```

On PowerShell, use quotes if needed:

```powershell
mvn clean test "-Dtest=TriFormApiIntegrationTest"
```

### Environment Setup

Create `.env` in the frontend folder:

```text
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Create `.env` in the backend folder:

```text
JWT_SECRET={your_secret}
JWT_EXPIRATION_MS={your_token_expiration}
```

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/account/register` | No | Register a new user |
| POST | `/account/login` | No | Log in and receive a JWT |

### Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/profile` | Yes | Create the logged-in user's profile |
| GET | `/api/profile` | Yes | Fetch the logged-in user's profile |
| PUT | `/api/profile` | Yes | Update the logged-in user's profile |

Profile data currently includes:

```text
metric
height
weight
birthday
experienceLevel
weeklyTrainingDays
maxWeekdayHours
maxWeekendHours
preferredRestDay
```

### Workouts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/workout` | Yes | Fetch the logged-in user's workouts |
| POST | `/api/workout` | Yes | Create a workout |
| PUT | `/api/workout/{id}` | Yes | Update a workout |
| DELETE | `/api/workout/{id}` | Yes | Delete a workout |

### Training Plans

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/plans/generate` | Yes | Generate a new training plan |
| GET | `/api/plans` | Yes | Fetch the logged-in user's training plans |
| GET | `/api/plans/{id}` | Yes | Fetch one training plan with planned workouts |
| DELETE | `/api/plans/{id}` | Yes | Delete a training plan |
| GET | `/api/plans/workouts/today` | Yes | Fetch today's planned workouts |
| GET | `/api/plans/workouts/week` | Yes | Fetch planned workouts for the current calendar week |
| PUT | `/api/plans/workouts/{id}/toggle-complete` | Yes | Toggle planned workout completion |
| POST | `/api/plans/workouts/{id}/log` | Yes | Create a logged workout from a planned workout and mark it completed |

## Training Plan Model

Training plan generation currently uses a rule-based system. A user submits:

```text
raceName
raceType
raceDay
location
```

The backend creates:

```text
RaceGoal
TrainingPlan
PlannedWorkout records
```

Current supported race types:

```text
SPRINT
OLYMPIC
HALF_IRONMAN
FULL_IRONMAN
```

Current plan lengths:

| Race Type | Weeks | Planned Workouts |
|----------|-------|------------------|
| SPRINT | 10 | 70 |
| OLYMPIC | 14 | 98 |
| HALF_IRONMAN | 20 | 140 |
| FULL_IRONMAN | 32 | 224 |

Each week currently includes seven generated workouts across running, swimming, and biking. New profile availability fields are collected now and can be used later by the rule-based generator or AI generator.

## Planned Workout Flow

Planned workouts support three important frontend states:

```text
completed = completed true
missed = scheduledDate before today and completed false
upcoming = scheduledDate today or later and completed false
```

Current behavior:

```text
Mark Complete on incomplete workout -> POST /api/plans/workouts/{id}/log
Undo Complete on completed workout -> PUT /api/plans/workouts/{id}/toggle-complete
```

Auto-logging creates a normal workout record from the planned workout. Duplicate protection prevents the same planned workout from creating multiple logged workouts.

## Roadmap

- [x] Authentication
- [x] Profile setup and editing
- [x] Training availability profile fields
- [x] Workout logging
- [x] Training plan backend
- [x] Training plan frontend
- [x] Planned workout completion toggle
- [x] Dashboard today/week planned workouts
- [x] Auto-log planned workouts into normal workouts
- [x] Duplicate log protection
- [x] Progress analytics MVP
- [x] Backend integration tests
- [ ] Responsive UI polish
- [ ] Clearer planned workout status enum
- [ ] Planned vs actual workout comparisons
- [ ] Edit-before-finalizing planned workout auto-log
- [ ] Backend progress analytics endpoints
- [ ] AI-powered plan generation
- [ ] AI-powered plan adaptation for missed workouts
- [ ] Wearable integrations
- [ ] Social features
- [ ] Training reminders

## Contact

For questions or interest, feel free to reach out.

---

Happy training and coding.
