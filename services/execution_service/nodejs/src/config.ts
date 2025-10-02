import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 8082,
};

export default config;
