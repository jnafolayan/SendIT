import dotenv from 'dotenv';

dotenv.config();

const config = {
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  password: process.env.PGPASSWORD || 'admin',
  database: process.env.PGDATABASE || 'sendit',
  port: +process.env.PGPORT || 5432,
};

export default config;
