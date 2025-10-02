import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 3002,
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/polyglot_db',
};

export default config;