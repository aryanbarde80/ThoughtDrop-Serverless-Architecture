import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.TURSO_DATABASE_URL) {
  console.error('ERROR: TURSO_DATABASE_URL environment variable is not set.');
}
if (!process.env.TURSO_AUTH_TOKEN) {
  console.error('ERROR: TURSO_AUTH_TOKEN environment variable is not set.');
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

export default client;
