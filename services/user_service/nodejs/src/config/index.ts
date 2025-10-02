
import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 8080,
  db: {
    host: process.env.DB_HOST || 'postgres',
    database: process.env.DB_NAME || 'polyglot',
    user: process.env.DB_USER || 'pp',
    password: process.env.DB_PASSWORD || 'pp',
  },
  jwt: {
    access_token_secret: process.env.ACCESS_TOKEN_SECRET || 'access-secret',
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
    access_token_expiry: '15m',
    refresh_token_expiry: '7d',
  },
};
