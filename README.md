# TriForm as of FEBRUARY 2026

**TriForm** is a comprehensive triathlon training platform designed to help athletes plan, track, and optimize their training regimens. Built with AI integration, TriForm generates personalized training plans tailored to your fitness level, goals, and schedule.

## Features

- **User Authentication** — JWT-based secure authentication with user registration and login
- **Full-Stack Setup** — Next.js frontend with Spring Boot backend, fully synchronized with CORS
- **API Integration** — Seamless frontend-backend communication with TypeScript type safety
- **Personalized Training Plans** — AI-powered training plan generation (coming soon)
- **Workout Tracking** — Log and monitor your swims, bikes, and runs (coming soon)
- **Progress Analytics** — Visualize your training progress over time (coming soon)
- **Responsive Backend API** — RESTful API for seamless integration with frontend clients

## Tech Stack

### Frontend
- **Framework:** Next.js 15+ (React)
- **Language:** TypeScript
- **Styling:** CSS Modules
- **HTTP Client:** Fetch API with custom helper functions
- **Development:** Running on `http://localhost:3000`

### Backend
- **Framework:** Spring Boot 3.5.10
- **Language:** Java 17+
- **Database:** SQLite with Hibernate ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Build Tool:** Maven
- **Development:** Running on `http://localhost:8080`

### Security
- Spring Security with CORS configuration
- JWT token validation on protected endpoints
- Password encryption with BCrypt
- Custom authorization filters

## Project Structure

```
TriForm/
├── frontend/                     # Next.js React application
│   ├── src/
│   │   ├── app/                 # Next.js app directory
│   │   │   ├── login/           # Login page
│   │   │   ├── register/        # Registration page
│   │   │   └── page.tsx         # Home page
│   │   ├── components/          # React components
│   │   ├── lib/
│   │   │   └── api-helper.ts    # API client utilities
│   │   └── styles/              # Global styles
│   ├── .env.local               # Environment configuration
│   └── package.json
│
├── backend/                      # Spring Boot application
│   ├── src/main/java/
│   │   ├── TriForm/             # Application entry point
│   │   ├── config/              # Configuration classes
│   │   ├── controllers/         # REST API endpoints
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── entities/            # JPA Entity classes
│   │   ├── exceptions/          # Custom exceptions
│   │   ├── repositories/        # Data access layer
│   │   ├── security/            # Security, CORS & JWT filters
│   │   └── services/            # Business logic
│   └── pom.xml                  # Maven dependencies
│
└── README.md
```

## Recent Progress (January - February 2026)

### Completed
- Full Next.js frontend scaffold with authentication pages
- TypeScript API helper utilities (`api-helper.ts`)
- Spring Security CORS configuration for frontend-backend communication
- RESTful authentication endpoints (login, register)
- JWT token management and validation
- User registration and login workflows
- Environment configuration setup

### In Progress
- Frontend form validation and error handling
- Integration testing between frontend and backend
- Protected route authentication on frontend

### Next Steps
- AI-powered training plan generation (OpenAI integration)
- Workout logging and tracking dashboard
- Progress analytics visualizations
- User profile management

## Getting Started

### Prerequisites
- Node.js 18+ (frontend)
- Java 17+ (backend)
- Maven 3.8+

### Running Locally

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

**Backend:**
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

### Environment Setup

Create `.env` in the frontend folder:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```
Create `.env` in the backend folder:
```
JWT_SECRET={your_secret}
JWT_EXPIRATION_MS={your_token_expiration}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/account/register` | Register new user |
| POST | `/api/account/login` | User login |

## Roadmap

- [ ] AI-powered training plan generation
- [ ] Workout logging and tracking interface
- [ ] Progress analytics dashboard with charts
- [ ] Mobile app (React Native)
- [ ] Social features (friend connections, shared workouts)
- [ ] Integration with fitness wearables (Strava, Garmin)
- [ ] Email notifications for training reminders

## Contact

For questions or interest, feel free to reach out!

---

**Happy training & coding! 🏊‍♂️🚴‍♂️🏃‍♂️**