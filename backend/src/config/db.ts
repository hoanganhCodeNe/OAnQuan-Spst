import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Auto-detect SSL: Enable SSL for remote databases (like Supabase, Neon) 
// unless connecting to local/Docker database instances
const isLocal = !connectionString || 
  connectionString.includes('localhost') || 
  connectionString.includes('127.0.0.1') || 
  connectionString.includes('@db:');

export const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
