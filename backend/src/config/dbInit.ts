import fs from 'fs';
import path from 'path';
import { pool } from './db';

export const initializeDatabase = async () => {
  try {
    console.log('Initializing database schemas and seeds...');
    const sqlPath = path.join(__dirname, '../../database/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    console.log('Database initialized successfully with achievements and history quiz questions.');
  } catch (err) {
    console.error('Failed to initialize database:', err);
    throw err;
  }
};

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('DB init script completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
