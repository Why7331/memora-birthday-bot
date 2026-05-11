import { Markup, Telegraf } from 'telegraf';
import { config } from './config.js';
import { upsertUser } from './db.js';

export const bot = config.BOT_TOKEN ? new Telegraf(config.BOT_TOKEN) : null;

export async function setupBotMenuButton() {
  if (!bot) return;

  await bot.telegram.setChatMenuButton({
    menuButton: {
      type: 'web_app',
      text: 'Открыть',
      web_app: {
        url: config.WEB_APP_URL
      }
    }
  });

  await bot.telegram.setMyCommands([
    { command: 'start', description: 'Открыть календарь' },
    { command: 'help', description: 'Помощь' }
  ]);
}

bot?.start(async (ctx) => {
  const from = ctx.from;
  if (from) {
    upsertUser({
      telegramId: from.id,
      firstName: from.first_name,
      username: from.username
    });
  }

  await ctx.reply(
    'Привет! Я помогу хранить дни рождения родственников и напоминать о них каждый год.',
    Markup.inlineKeyboard([
      Markup.button.webApp('Открыть', config.WEB_APP_URL)
    ])
  );
});

bot?.command('help', async (ctx) => {
  await ctx.reply('Нажми кнопку “Открыть”, чтобы запустить Mini App.');
});
