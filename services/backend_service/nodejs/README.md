# Backend Service

Node.js backend for Polyglot Code-Sharing Platform using Express, Prisma, and Supabase.

## Features

- Authentication with JWT and 2FA
- Snippet management with sandboxed execution
- Leaderboard and gamification
- Admin panel
- Real-time notifications

## Setup

1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Run Prisma migrations: `npx prisma migrate dev`
4. Start dev server: `npm run dev`

## Environment Variables

- DATABASE_URL: Supabase PostgreSQL URL
- JWT_SECRET: Secret for JWT
- SUPABASE_URL: Supabase project URL
- SUPABASE_ANON_KEY: Supabase anon key
- EMAIL_USER: For notifications
- EMAIL_PASS: Email password