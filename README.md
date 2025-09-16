# Polyglot Playground

## Project Description
The Polyglot Playground is a platform designed to showcase and compare backend services implemented in various programming languages. It features a React-based frontend, a Node.js user service, and a PostgreSQL database, all orchestrated using Docker Compose. This project aims to provide a flexible environment for exploring different language implementations and their performance characteristics.

## Features
- **User Authentication:** Secure user login and registration.
- **User Profile Management:** View and manage user details.
- **Code Snippet Management:** Create, store, and execute code snippets in various languages.
- **Admin User Management:** (Admin-only) View and manage registered users.
- **Analytics:** View top users based on code snippet activity.
- **Dockerized Environment:** Easy setup and deployment using Docker Compose.

## Tech Stack

### Frontend
- **Framework:** React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM

### Backend (User Service)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript (with TypeScript for type definitions)
- **Database ORM/Client:** `pg` (PostgreSQL client)
- **Authentication:** `bcrypt` for password hashing, `jsonwebtoken` for JWTs
- **Middleware:** `body-parser`, `cors`

### Database
- **Type:** PostgreSQL
- **Version:** 15.4
- **Schema:**
    - `users`: Stores user information (email, password hash, created_at).
    - `snippets`: Stores code snippets (title, language, code, visibility).
    - `executions`: Stores snippet execution details (input, output, status, runtime).

### Infrastructure
- **Containerization:** Docker
- **Orchestration:** Docker Compose

## Getting Started

### Prerequisites
- Docker Desktop installed and running on your machine.

### Installation and Setup
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kawacukennedy/polygot.git
    cd polygot
    ```
2.  **Navigate to the Docker Compose directory:**
    ```bash
    cd infra/docker
    ```
3.  **Build and run the services:**
    ```bash
    docker-compose up --build
    ```
    This command will:
    - Build the Docker images for the frontend and user service.
    - Start the PostgreSQL database.
    - Start the Node.js user service.
    - Start the Nginx server to serve the React frontend.

### Accessing the Application
- **Frontend:** Once all services are up, open your web browser and navigate to `http://localhost:3000`.
- **Backend (User Service API):** The user service API is accessible at `http://localhost:8080/api/v1`.

## Project Structure
```
.
├── apps/                 # Frontend and mobile applications
│   ├── frontend/         # React frontend application
│   └── mobile/           # Mobile application (e.g., Flutter)
├── benchmarks/           # Performance benchmarks
├── docs/                 # Documentation
├── infra/                # Infrastructure configurations
│   ├── docker/           # Docker Compose setup
│   └── k8s/              # Kubernetes configurations
├── migrations/           # Database migration scripts
├── services/             # Backend microservices
│   ├── user_service/     # User management service
│   │   └── nodejs/       # Node.js implementation of user service
│   └── ...               # Other services (product, cart, analytics, etc.)
└── tools/                # Development tools
```

## API Endpoints (User Service)
- `POST /api/v1/auth/register`: Register a new user.
- `POST /api/v1/auth/login`: Authenticate a user and get session tokens.
- `GET /api/v1/users/:id`: Fetch details of a specific user.
- `POST /api/v1/snippets`: Create a new code snippet.
- `POST /api/v1/snippets/:id/run`: Execute a code snippet.
- `GET /api/v1/admin/users`: (Admin) Fetch a list of all registered users.
- `GET /api/v1/analytics/top-users`: Fetch top users based on analytics.

## Contributing
Contributions are welcome! Please refer to `CONTRIBUTING.md` for guidelines.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.
