import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 8081,
  db: {
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'polyglot',
    user: process.env.DB_USER || 'polyglot',
    password: process.env.DB_PASSWORD || 'polyglot',
  },
  jwt: {
    access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'supersecretjwtkey',
  },
};

export default config;
