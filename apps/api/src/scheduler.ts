import cron from 'node-cron';
import { bot, sendBotTyping } from './bot.js';
import { config } from './config.js';
import { monthDay } from './birthdayUtils.js';
import { query, type Birthday } from './db.js';

type ReminderRow = Birthday & {
  telegram_id: number;
  first_name: string | null;
  username: string | null;
};

function buildReminderMessage(items: ReminderRow[]) {
  if (items.length > 1) {
    const names = items.map((item) => `— ${item.name}`).join('\n');

    return `🎂 Сегодня важный день\n\nДни рождения:\n${names}\n\nНе забудьте поздравить ✨`;
  }

  const [item] = items;
  if (item.relation?.trim()) {
    return `🎂 Сегодня день рождения у ${item.name}\n\n${item.relation} ждёт вашего внимания.\nНе забудьте поздравить ✨`;
  }

  return `🎂 Сегодня день рождения у ${item.name}\n\nНе забудьте поздравить ✨`;
}

export async function sendTodayReminders(now = new Date()) {
  if (!bot) return;

  const today = now.toISOString().slice(0, 10);
  const todayMonthDay = today.slice(5);

  const result = await query<ReminderRow>(`
    SELECT birthdays.*, users.telegram_id, users.first_name, users.username
    FROM birthdays
    JOIN users ON users.id = birthdays.user_id
  `);

  const remindersByChat = new Map<number, ReminderRow[]>();

  for (const row of result.rows) {
    if (monthDay(row.birth_date) !== todayMonthDay) continue;

    const alreadySent = await query(
      'SELECT id FROM sent_reminders WHERE birthday_id = $1 AND sent_on = $2',
      [row.id, today]
    );

    if (alreadySent.rowCount) continue;

    const currentItems = remindersByChat.get(row.telegram_id) ?? [];
    currentItems.push(row);
    remindersByChat.set(row.telegram_id, currentItems);
  }

  for (const [chatId, items] of remindersByChat) {
    await sendBotTyping(chatId);
    await bot.telegram.sendMessage(chatId, buildReminderMessage(items));

    for (const item of items) {
      await query(
        'INSERT INTO sent_reminders (birthday_id, sent_on) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [item.id, today]
      );
    }
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
