import { config } from 'dotenv';

config();

if (!process.env.DATABASE_URL) {
  config({ path: '../../.env' });
}
