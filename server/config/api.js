import dotenv from 'dotenv';

dotenv.config();

export const PORT = +process.env.PORT || 3000;

export const VERSION = process.env.VERSION || 'v1';

export const API_URL = `//localhost:${PORT}/api/${VERSION}`;
