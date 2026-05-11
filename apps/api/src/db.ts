import pg, { type QueryResultRow } from 'pg';
import { config } from './config.js';

const { Pool } = pg;

export type DbUser = {
  id: number;
  telegram_id: number;
  first_name: string | null;
  username: string | null;
  created_at: string;
};

export type Birthday = {
  id: number;
  user_id: number;
  name: string;
  relation: string;
  birth_date: string;
  note: string | null;
  gift_idea: string | null;
  created_at: string;
  updated_at: string;
};

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  const result = await pool.query<T>(text, params);
  return result;
}

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      telegram_id BIGINT NOT NULL UNIQUE,
      first_name TEXT,
      username TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS birthdays (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      relation TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      note TEXT,
      gift_idea TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_birthdays_user_id ON birthdays(user_id);
    CREATE INDEX IF NOT EXISTS idx_birthdays_birth_date ON birthdays(birth_date);

    CREATE TABLE IF NOT EXISTS sent_reminders (
      id BIGSERIAL PRIMARY KEY,
      birthday_id BIGINT NOT NULL REFERENCES birthdays(id) ON DELETE CASCADE,
      sent_on DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (birthday_id, sent_on)
    );
  `);
}

export async function upsertUser(input: { telegramId: number; firstName?: string | null; username?: string | null }) {
  const result = await query<DbUser>(
    `
      INSERT INTO users (telegram_id, first_name, username)
      VALUES ($1, $2, $3)
      ON CONFLICT (telegram_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        username = EXCLUDED.username
      RETURNING *
    `,
    [input.telegramId, input.firstName ?? null, input.username ?? null]
  );

  return result.rows[0];
}
