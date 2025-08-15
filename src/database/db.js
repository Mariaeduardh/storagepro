import 'dotenv/config';
import postgres from 'postgres';

export const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',            
  max: 10,                   
  idle_timeout: 20
});
