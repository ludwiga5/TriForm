# TriForm as of JAN 2026

**TriForm** is a comprehensive triathlon training platform designed to help athletes plan, track, and optimize their training regimens. Built with AI integration, TriForm generates personalized training plans tailored to your fitness level, goals, and schedule.

## Features

- **User Authentication** — JWT-based secure authentication with user registration and login
- **Personalized Training Plans** — AI-powered training plan generation (coming soon)
- **Workout Tracking** — Log and monitor your swims, bikes, and runs
- **Progress Analytics** — Visualize your training progress over time
- **Responsive Backend API** — RESTful API for seamless integration with frontend clients

## Tech Stack

### Backend
- **Framework:** Spring Boot 3.5.10
- **Language:** Java 17+
- **Database:** SQLite with Hibernate ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Build Tool:** Maven

### Security
- Spring Security for request filtering
- Password encryption with BCrypt
- JWT token validation on protected endpoints

## Project Structure

```
TriForm/
├── backend/
│   ├── src/main/java/
│   │   ├── TriForm/              # Application entry point
│   │   ├── config/               # Configuration classes (JWT, Database)
│   │   ├── controllers/          # REST API endpoints
│   │   ├── dto/                  # Data Transfer Objects
│   │   ├── entities/             # JPA Entity classes
│   │   ├── exceptions/           # Custom exceptions
│   │   ├── repositories/         # Data access layer
│   │   ├── security/             # Security filters & config
│   │   └── services/             # Business logic
│   ├── src/main/resources/
│   │   ├── application.yml       # Spring Boot configuration
│   │   └── db/migration/         # Database schema
│   └── pom.xml                   # Maven dependencies
└── README.md
```

## Roadmap

- [ ] AI-powered training plan generation
- [ ] Workout logging and tracking
- [ ] Progress analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Social features (friend connections, shared workouts)
- [ ] Integration with fitness wearables

## Contact

For questions or interest, reach out to me!

---

**Happy training & coding! 🏊‍♂️🚴‍♂️🏃‍♂️**