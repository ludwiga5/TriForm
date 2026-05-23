# TriForm — May 2026
 
**TriForm** is a comprehensive triathlon training platform designed to help athletes plan, track, and optimize their training regimens. Built with AI integration, TriForm generates personalized training plans tailored to your fitness level, goals, and schedule.
 
## Features
 
- **User Authentication** — JWT-based secure authentication with registration and login
- **User Profiles** — Athlete profile setup with height, weight, age, and metric/imperial unit preference
- **Full-Stack Setup** — Next.js frontend with Spring Boot backend, synchronized with CORS
- **API Integration** — Seamless frontend-backend communication with TypeScript type safety
- **Personalized Training Plans** — AI-powered training plan generation (coming soon)
- **Workout Tracking** — Log and monitor your swims, bikes, and runs (coming soon)
- **Progress Analytics** — Visualize your training progress over time (coming soon)
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
- Custom authorization filter with SecurityContext integration
## Project Structure
 
```
TriForm/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── register/        # Registration page → auto-login → profile setup
│   │   │   ├── profile/         # Profile setup page (protected)
│   │   │   └── page.tsx         # Home page with login
│   │   ├── components/
│   │   └── lib/
│   │       ├── api-helper.ts    # API client with auth helpers
│   │       └── types.ts         # Shared TypeScript interfaces
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── src/main/java/
│   │   ├── TriForm/             # Application entry point
│   │   ├── config/              # DatabaseManager, JwtProperties, PasswordHash
│   │   ├── controllers/         # AuthController, UserController
│   │   ├── dto/                 # JwtResponse, UserProfileRequest, UserProfileResponse
│   │   ├── entities/            # BaseEntity, User, UserProfile
│   │   ├── exceptions/          # Custom runtime exceptions
│   │   ├── repositories/        # UserRepository, UserProfileRepository
│   │   ├── security/            # AuthorizationFilter, CorsConfig, SecurityConfig
│   │   └── services/            # JwtService, UserService, UserProfileService
│   ├── .env
│   └── pom.xml
│
└── README.md
```
 
## Completed
 
- Full Next.js frontend with login, registration, and profile setup pages
- Registration flow with auto-login and redirect to profile setup
- TypeScript API helper utilities with authenticated request support (`AuthGetRequest`, `AuthPostRequest`, `PutRequest`)
- Shared type definitions in `types.ts`
- Spring Security CORS configuration
- RESTful authentication endpoints (`/account/register`, `/account/login`)
- JWT token generation, validation, and SecurityContext integration
- User registration and login with BCrypt password hashing
- User profile creation and retrieval (`POST /api/profile`, `GET /api/profile`)
- `UserProfile` entity with `@OneToOne` relationship to `User`
- DTO layer separating API contracts from JPA entities (`UserProfileRequest`, `UserProfileResponse`)
- Custom exception handling for malformed request bodies
## In Progress
 
- Dashboard shell and post-login routing
- Protected route handling on the frontend
## Next Steps
 
- Workout logging and tracking (swim, bike, run sessions)
- Training plan generation with rule-based periodization
- AI-powered plan generation (OpenAI integration)
- Progress analytics dashboard
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
 
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/account/register` | No | Register new user |
| POST | `/account/login` | No | User login, returns JWT |
| POST | `/api/profile` | Yes | Create user profile |
| GET | `/api/profile` | Yes | Fetch user profile |
 
## Roadmap
 
- [ ] Workout logging and tracking interface
- [ ] Training plan generation (rule-based + AI)
- [ ] Progress analytics dashboard with charts
- [ ] Mobile app (React Native)
- [ ] Wearable integrations (Strava, Garmin)
- [ ] Social features (friend connections, shared workouts)
- [ ] Email notifications for training reminders
## Contact
 
For questions or interest, feel free to reach out!
 
---
 
**Happy training & coding! 🏊‍♂️🚴‍♂️🏃‍♂️**