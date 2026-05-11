import cron from 'node-cron';
import { bot } from './bot.js';
import { config } from './config.js';
import { ageOnDate, monthDay } from './birthdayUtils.js';
import { query, type Birthday } from './db.js';

type ReminderRow = Birthday & {
  telegram_id: number;
  first_name: string | null;
  username: string | null;
};

export async function sendTodayReminders(now = new Date()) {
  if (!bot) return;

  const today = now.toISOString().slice(0, 10);
  const todayMonthDay = today.slice(5);

  const result = await query<ReminderRow>(`
    SELECT birthdays.*, users.telegram_id, users.first_name, users.username
    FROM birthdays
    JOIN users ON users.id = birthdays.user_id
  `);

  for (const row of result.rows) {
    if (monthDay(row.birth_date) !== todayMonthDay) continue;

    const alreadySent = await query(
      'SELECT id FROM sent_reminders WHERE birthday_id = $1 AND sent_on = $2',
      [row.id, today]
    );

    if (alreadySent.rowCount) continue;

    const age = ageOnDate(row.birth_date, now);
    const ageText = age ? ` Сегодня исполняется ${age}.` : '';
    const giftText = row.gift_idea ? `\nИдея подарка: ${row.gift_idea}` : '';

    await bot.telegram.sendMessage(
      row.telegram_id,
      `Сегодня день рождения: ${row.name} (${row.relation}).${ageText}${giftText}`
    );

    await query(
      'INSERT INTO sent_reminders (birthday_id, sent_on) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [row.id, today]
    );
  }
}

export function startScheduler() {
  if (!bot) {
    console.warn('Reminder scheduler is disabled until BOT_TOKEN is set.');
    return;
  }

  cron.schedule(
    config.REMINDER_CRON,
    () => {
      sendTodayReminders().catch((error) => {
        console.error('Reminder scheduler failed:', error);
      });
    },
    { timezone: config.TIMEZONE }
  );
}
