import { Markup, Telegraf } from 'telegraf';
import { config } from './config.js';
import { query, upsertUser } from './db.js';

export const bot = config.BOT_TOKEN ? new Telegraf(config.BOT_TOKEN) : null;

const openMemoraKeyboard = Markup.inlineKeyboard([
  Markup.button.webApp('Открыть Memora', config.WEB_APP_URL)
]);

async function sendTyping(chatId: number) {
  await bot?.telegram.sendChatAction(chatId, 'typing').catch(() => undefined);
}

export async function setupBotMenuButton() {
  if (!bot) return;

  await bot.telegram.setChatMenuButton({
    menuButton: {
      type: 'web_app',
      text: 'Открыть Memora',
      web_app: {
        url: config.WEB_APP_URL
      }
    }
  });

  await bot.telegram.setMyCommands([
    { command: 'start', description: 'открыть Memora' },
    { command: 'help', description: 'как пользоваться' },
    { command: 'app', description: 'открыть Mini App' }
  ]);
}

bot?.start(async (ctx) => {
  const chatId = ctx.chat?.id;
  const from = ctx.from;
  if (!chatId) return;

  let isNewUser = false;

  if (from) {
    const existingUser = await query('SELECT id FROM users WHERE telegram_id = $1 LIMIT 1', [from.id]);
    isNewUser = existingUser.rowCount === 0;

    await upsertUser({
      telegramId: from.id,
      firstName: from.first_name,
      username: from.username
    });
  }

  await sendTyping(chatId);

  if (isNewUser) {
    await ctx.reply(
      'Добро пожаловать в Memora ✨\n\nХраните дни рождения близких\nи получайте красивые напоминания каждый год.',
      openMemoraKeyboard
    );
    return;
  }

  await ctx.reply(
    '✨ Memora\n\nПомнит важные даты за вас.\n\nОткрыть календарь ↓',
    openMemoraKeyboard
  );
});

bot?.command('help', async (ctx) => {
  const chatId = ctx.chat?.id;
  if (chatId) await sendTyping(chatId);

  await ctx.reply(
    'Memora помогает помнить дни рождения близких.\n\nОткройте приложение, добавьте людей,\nи я напомню о важных датах каждый год.',
    openMemoraKeyboard
  );
});

bot?.command('app', async (ctx) => {
  const chatId = ctx.chat?.id;
  if (chatId) await sendTyping(chatId);

  await ctx.reply('Memora готова.', openMemoraKeyboard);
});

export async function sendBotTyping(chatId: number) {
  await sendTyping(chatId);
}
