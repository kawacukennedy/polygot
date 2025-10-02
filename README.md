# PolyglotCodeHub

## Cross-language collaborative code snippet platform with execution, sharing, leaderboards, analytics, and gamification.

PolyglotCodeHub is a modern web application designed to empower developers to write, run, share, and collaborate on code snippets across various programming languages. It features a robust backend with multiple microservices, a dynamic React frontend, and a comprehensive set of tools for code management, execution, and community interaction.

## Features

- **User Authentication**: Secure signup, login, and session management with JWTs.
- **Code Snippet Management**: Create, edit, view, and delete code snippets with syntax highlighting and autosave using the Monaco Editor.
- **Real-time Code Execution**: Execute code snippets in an isolated environment with real-time status updates via WebSockets.
- **Profile Management**: Users can update their profile information, change passwords, and upload avatars.
- **Leaderboards**: Track and display top users based on their activity and contributions.
- **Admin Panel**: Comprehensive tools for administrators to manage users, snippets, and executions, and monitor system health.
- **Responsive UI**: A modern, intuitive, and responsive user interface with light/dark theme toggling and animations.
- **API-driven Microservices**: A modular backend architecture built with Node.js microservices for scalability and maintainability.
- **CI/CD**: Automated build, test, and deployment pipelines using GitHub Actions for both frontend and backend services.

## Technologies Used

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **Material-UI (MUI)**: A comprehensive suite of UI tools for faster and easier web development.
- **Monaco Editor**: The code editor that powers VS Code, integrated for rich code editing.
- **Socket.IO Client**: For real-time communication with the execution service.
- **Recharts**: A composable charting library built on React components.
- **React Router DOM**: For declarative routing in React applications.

### Backend (Node.js Microservices)
- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
- **PostgreSQL**: A powerful, open-source object-relational database system.
- **pg**: Non-blocking PostgreSQL client for Node.js.
- **bcrypt**: For hashing passwords securely.
- **jsonwebtoken**: For implementing JSON Web Token (JWT) based authentication.
- **Socket.IO**: For real-time, bidirectional event-based communication.
- **dotenv**: To load environment variables from a `.env` file.
- **cors**: Node.js package for providing a Connect/Express middleware that can be used to enable CORS.

### Other Tools & Services
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Docker**: For containerization of backend services.
- **GitHub Actions**: For Continuous Integration and Continuous Deployment (CI/CD).
- **Vercel**: For hosting the frontend application.
- **Railway**: For hosting the backend microservices.
- **Supabase**: Provides PostgreSQL database and file storage.
- **Render**: For hosting isolated code execution workers.
- **Sentry**: For application monitoring and error tracking.

## Getting Started

Follow these instructions to set up and run the PolyglotCodeHub project locally.

### Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- Docker (optional, but recommended for local backend development)
- PostgreSQL database (local or remote, e.g., via Supabase)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/polyglotcodehub.git
cd polyglotcodehub
```

### 2. Database Setup

PolyglotCodeHub uses PostgreSQL. You'll need a running PostgreSQL instance. You can use a local setup or a cloud provider like Supabase.

#### Local PostgreSQL Setup (Example using Docker)

```bash
docker run --name polyglot-postgres -e POSTGRES_USER=pp -e POSTGRES_PASSWORD=pp -e POSTGRES_DB=polyglot -p 5432:5432 -d postgres
```

#### Apply Migrations

Navigate to the project root and apply the database migrations. You can use `psql` for this:

```bash
# Connect to your database
psql -U pp -d polyglot -h localhost -p 5432

# Inside psql, execute migration files one by one
\i migrations/001_create_users_products_carts.sql
\i migrations/002_create_benchmark_results.sql
\i migrations/003_create_snippets_table.sql
\i migrations/004_add_user_details_to_users_table.sql
\i migrations/005_create_executions_table.sql

# Or from your shell directly (replace credentials as needed)
psql -U pp -d polyglot -h localhost -p 5432 -f migrations/001_create_users_products_carts.sql
# ... repeat for other migration files
psql -U pp -d polyglot -h localhost -p 5432 -f migrations/005_create_executions_table.sql
```

### 3. Backend Services Setup

Each backend service is a Node.js application. You'll need to configure environment variables for each.

#### Environment Variables (`.env` files)

Create a `.env` file in each service directory (`services/user_service/nodejs`, `services/snippet_service/nodejs`, etc.) based on the `config/index.ts` files. Here's an example for `services/user_service/nodejs/.env`:

```
PORT=3001
DB_HOST=localhost
DB_NAME=polyglot
DB_USER=pp
DB_PASSWORD=pp
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Adjust `PORT` and database credentials as per your setup. Ensure `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are strong, unique values.

#### Install Dependencies and Run Services

For each Node.js service, navigate to its directory, install dependencies, and start it in development mode:

```bash
# User Service
cd services/user_service/nodejs
npm install
npm run dev &

# Snippet Service
cd ../snippet_service/nodejs
npm install
npm run dev &

# Analytics Service
cd ../analytics_service/nodejs
npm install
npm run dev &

# Execution Service
cd ../execution_service/nodejs
npm install
npm run dev &
```

### 4. Frontend Application Setup

```bash
cd apps/frontend
npm install

# Create a .env file for frontend (e.g., apps/frontend/.env)
# REACT_APP_API_BASE_URL=http://localhost:3001/api/v1

npm start
```

The frontend application should now be running at `http://localhost:3000` (or another port if configured).

## CI/CD

This project uses GitHub Actions for Continuous Integration and Continuous Deployment. Workflows are defined in the `.github/workflows/` directory.

- `frontend.yml`: Builds and deploys the frontend application to Vercel on pushes to the `main` branch within the `apps/frontend` directory.
- `backend.yml`: Builds and deploys backend services to Railway on pushes to the `main` branch within the `services/` directory.

Refer to `DEPLOYMENT.md` for detailed deployment instructions and environment variable configurations for production environments.