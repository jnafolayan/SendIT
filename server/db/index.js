import { Pool } from 'pg';
import config from '../config/db';

const db = new Pool(config);

export default db;
