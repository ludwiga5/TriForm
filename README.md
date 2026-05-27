# TriForm — May 2026

**TriForm** is a full-stack triathlon training platform for athletes who want to log workouts, manage profile data, and generate structured race-specific training plans. The project uses a Next.js frontend, a Spring Boot backend, JWT authentication, and a SQLite database.

## Features

- **User Authentication** — Secure registration and login with JWT authentication
- **User Profiles** — Athlete profile setup with height, weight, birthday, and metric/imperial unit preference
- **Dashboard** — Protected dashboard that summarizes logged training activity
- **Workout Tracking** — Create, view, edit, and delete swim, bike, and run workouts
- **Training Plan Generation** — Rule-based training plan generation based on race type and race date
- **Planned Workouts** — Automatically generated planned workouts with discipline, type, target duration, target distance, notes, week number, and completion status
- **Account Management** — Edit existing athlete profile information
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
- **Current Coverage:** Authentication, profiles, workouts, training plans, ownership/security checks, bad request handling, and CORS preflight handling

### Security

- Spring Security configuration for protected routes
- JWT token validation on authenticated endpoints
- BCrypt password hashing
- Custom authorization filter with SecurityContext integration
- CORS configuration for frontend/backend communication
- Ownership checks for workouts and training plans

## Project Structure

```text
TriForm/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── account/         # Account/profile editing page
│   │   │   ├── dashboard/       # Protected training dashboard
│   │   │   ├── log/             # Workout logging page
│   │   │   ├── profile/         # Initial profile setup page
│   │   │   ├── register/        # Registration page
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx         # Login/home page
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
- Protected route handling for profile, dashboard, log, and account pages
- Workout logging with create, read, update, and delete support
- Workout support for title, discipline, type, date, duration, distance, and notes
- Training plan backend with race goals, training plans, and planned workouts
- Rule-based plan generation for Sprint, Olympic, Half Ironman, and Full Ironman race types
- Plan listing, plan detail retrieval, and plan deletion endpoints
- Ownership checks preventing users from viewing, editing, or deleting another user's data
- Integration test suite covering core backend behavior
- H2 test database configuration for reliable automated testing

## In Progress

- Training plan frontend page
- Training plan display UI
- Planned workout completion flow
- Frontend styling polish across dashboard, log, account, and training pages

## Next Steps

- Add a frontend training page for generating and viewing plans
- Add planned workout completion endpoint and UI
- Add planned workout editing for individual schedule adjustments
- Add dashboard summaries based on logged workouts and planned workouts
- Add progress analytics and charts
- Add AI-powered plan generation after the rule-based system is complete

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

Each week currently includes seven generated workouts across running, swimming, and biking.

## Roadmap

- [x] Authentication
- [x] Profile setup and editing
- [x] Workout logging
- [x] Training plan backend
- [x] Backend integration tests
- [ ] Training plan frontend
- [ ] Planned workout completion
- [ ] Planned workout editing
- [ ] Progress analytics dashboard
- [ ] AI-powered plan generation
- [ ] Wearable integrations
- [ ] Social features
- [ ] Training reminders

## Contact

For questions or interest, feel free to reach out.

---

Happy training and coding.
