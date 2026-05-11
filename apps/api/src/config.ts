import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(currentDir, '../../../.env')
];

const envPath = envPaths.find((candidate) => fs.existsSync(candidate));
dotenv.config(envPath ? { path: envPath } : undefined);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  WEB_APP_URL: z.string().url().default('https://example.com'),
  BOT_TOKEN: z.string().default(''),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REMINDER_CRON: z.string().default('0 9 * * *'),
  TIMEZONE: z.string().default('Europe/Moscow'),
  DEV_TELEGRAM_ID: z.coerce.number().optional()
});

export const config = schema.parse(process.env);
