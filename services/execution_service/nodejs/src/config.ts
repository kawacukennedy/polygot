import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 3003,
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
};

export default config;