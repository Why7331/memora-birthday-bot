import { migrate, query, upsertUser } from './db.js';
import { config } from './config.js';

await migrate();

const user = await upsertUser({
  telegramId: config.DEV_TELEGRAM_ID ?? 100001,
  firstName: 'Demo',
  username: 'demo_user'
});

const count = await query<{ total: string }>(
  'SELECT COUNT(*) as total FROM birthdays WHERE user_id = $1',
  [user.id]
);

if (Number(count.rows[0].total) === 0) {
  await query(
    `
      INSERT INTO birthdays (user_id, name, relation, birth_date, note, gift_idea)
      VALUES
        ($1, 'Анна', 'мама', '1974-05-22', 'Любит цветы и театр', 'Билеты на спектакль'),
        ($1, 'Игорь', 'брат', '0000-08-14', 'Год рождения не указан', 'Книга или наушники'),
        ($1, 'Мария', 'бабушка', '1949-12-03', 'Позвонить утром', 'Красивый чайный набор')
    `,
    [user.id]
  );
}

console.log(`Demo data is ready for Telegram user ${user.telegram_id}`);
process.exit(0);
