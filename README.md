# Family Birthday Calendar

MVP Telegram-бота и Telegram Mini App для календаря дней рождения родственников.

Стек:

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + TypeScript + Express
- Bot: Telegraf
- Database: PostgreSQL, Neon подходит для бесплатного MVP
- Scheduler: node-cron

## Структура проекта

```text
apps/
  api/
    src/
      index.ts              # запуск API, Telegram-бота и scheduler
      bot.ts                # команда /start и кнопка Mini App
      routes.ts             # REST API
      db.ts                 # PostgreSQL schema и подключение
      telegramAuth.ts       # проверка Telegram WebApp initData
      scheduler.ts          # ежедневные напоминания
      seed.ts               # demo данные
  web/
    src/
      App.tsx               # Mini App интерфейс
      api.ts                # запросы к backend
      telegram.ts           # Telegram WebApp helpers
      date.ts               # календарная логика
```

## Что умеет MVP

- `/start` в Telegram-боте.
- Кнопка открытия Telegram Mini App.
- Проверка Telegram `initData` на backend.
- Пользователь видит только свои дни рождения.
- REST API:
  - `GET /api/me`
  - `GET /api/birthdays`
  - `POST /api/birthdays`
  - `PUT /api/birthdays/:id`
  - `DELETE /api/birthdays/:id`
- Добавление, редактирование и удаление родственников.
- Месячный календарь в стиле iOS Calendar.
- Список ближайших дней рождения.
- Ежедневная проверка базы и отправка напоминаний день в день.
- Если год рождения неизвестен, возраст не показывается.

## Как запустить локально

### 1. Установи Node.js

Нужен Node.js версии 22.5 или новее. На твоей машине уже виден Node.js 24, он подходит.

Проверить:

```bash
node -v
npm -v
```

Если PowerShell пишет, что `npm.ps1` нельзя загрузить, используй `npm.cmd` вместо `npm`.

Например:

```bash
npm.cmd run seed
npm.cmd run dev
```

### 2. Установи зависимости

В корневой папке проекта:

```bash
npm install
```

В PowerShell на Windows можно так:

```bash
npm.cmd install
```

### 3. Создай Telegram-бота

1. Открой Telegram.
2. Найди [@BotFather](https://t.me/BotFather).
3. Отправь команду `/newbot`.
4. BotFather выдаст токен вида `123456:ABC...`.

### 4. Создай `.env`

Скопируй пример:

```bash
copy .env.example .env
```

В Linux/macOS команда будет:

```bash
cp .env.example .env
```

Открой `.env` и вставь токен:

```env
BOT_TOKEN=сюда_вставь_токен_от_BotFather
```

Для команды `seed` токен не обязателен. Но для настоящего Telegram-бота и кнопки `/start` токен нужен.

### 5. Добавь demo данные

```bash
npm run seed
```

Если PowerShell блокирует `npm`, запусти:

```bash
npm.cmd run seed
```

### 6. Запусти проект

```bash
npm run dev
```

Если PowerShell блокирует `npm`, запусти:

```bash
npm.cmd run dev
```

После запуска:

- API: `http://localhost:3000`
- Web Mini App: `http://localhost:5173`

В обычном браузере можно открыть `http://localhost:5173`, но полноценная авторизация Mini App работает через Telegram.

## Как подключить Mini App к Telegram

Telegram Mini App должен открываться по публичному HTTPS URL. `localhost` внутри Telegram не подойдет.

Для разработки удобно использовать `localhost.run`. Регистрация не нужна.

Сначала собери frontend и запусти backend, который будет отдавать Mini App:

```bash
npm.cmd run telegram
```

В отдельном терминале открой HTTPS-туннель на backend-порт `3000`:

```bash
npm.cmd run tunnel
```

Туннель выдаст адрес вида:

```text
https://your-name.lhr.life
```

В `.env` вставь этот адрес:

```env
WEB_APP_URL=https://your-name.lhr.life
```

После изменения `.env` перезапусти:

```bash
npm.cmd run telegram
```

Теперь команда `/start` в боте покажет кнопку открытия Mini App.

## База данных Neon PostgreSQL

Для бесплатного постоянного хранения данных используй Neon.

1. Создай проект на [Neon](https://neon.tech/).
2. Открой блок **Connection string**.
3. Нажми **Copy snippet**.
4. Вставь строку в `.env`:

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

Важно: пароль должен быть внутри строки. Если в Neon включено **Hide password**, нажми **Show password** или скопируй snippet так, чтобы пароль был подставлен.

Основные таблицы:

- `users`
  - `id`
  - `telegram_id`
  - `first_name`
  - `username`
  - `created_at`
- `birthdays`
  - `id`
  - `user_id`
  - `name`
  - `relation`
  - `birth_date`
  - `note`
  - `gift_idea`
  - `created_at`
  - `updated_at`

Дополнительно есть таблица `sent_reminders`, чтобы не отправлять одно и то же напоминание несколько раз за день.

Таблицы создаются автоматически при запуске backend.

## Напоминания

Scheduler запускается вместе с backend.

Настройки в `.env`:

```env
REMINDER_CRON=0 9 * * *
TIMEZONE=Europe/Moscow
```

Это значит: каждый день в 09:00 по московскому времени проверить дни рождения.

## Важно про безопасность

Frontend отправляет Telegram `initData` в заголовке:

```text
Authorization: tma <initData>
```

Backend пересчитывает hash через `BOT_TOKEN`. Если подпись неверная, API вернет `401`.

Все запросы к дням рождения фильтруются по `user_id`, который backend получает из Telegram `user.id`. Поэтому один пользователь не может получить или изменить записи другого.

## Production заметки

Для реального деплоя нужно:

- указать настоящий `WEB_APP_URL`;
- указать `DATABASE_URL` от Neon;
- собрать проект командой `npm.cmd run build`;
- запустить backend как Node.js сервис.

## Деплой на Render + Neon

Это самый простой бесплатный вариант без белого IP.

1. Создай Neon-проект и скопируй `DATABASE_URL`.
2. Загрузи проект на GitHub.
3. На Render создай **New Web Service** из GitHub-репозитория.
4. Render может использовать файл `render.yaml` из корня проекта.
5. Добавь Environment Variables:

```env
NODE_ENV=production
BOT_TOKEN=токен_от_BotFather
DATABASE_URL=postgresql://...
WEB_APP_URL=https://имя-сервиса.onrender.com
REMINDER_CRON=0 9 * * *
TIMEZONE=Europe/Moscow
```

6. После первого деплоя Render даст постоянную HTTPS-ссылку вида:

```text
https://имя-сервиса.onrender.com
```

7. Эту ссылку вставь:

- в Render env `WEB_APP_URL`;
- в BotFather как Mini App URL.

8. Перезапусти Render service.

Ограничение бесплатного Render: сервис может засыпать после простоя, поэтому напоминания на free-тарифе не гарантированы идеально. Для MVP и проверки Mini App этого достаточно.

## Можно ли хостить на своем ПК

Да, можно. Но Telegram Mini App не умеет открывать `localhost`, поэтому твой ПК должен быть доступен из интернета по постоянной HTTPS-ссылке.

Есть 3 нормальных варианта:

1. **Белый статический IP + домен**

   Самый правильный вариант для домашнего хостинга.

   Нужно:

   - попросить у провайдера белый статический IP;
   - купить или подключить домен;
   - на роутере пробросить порты `80` и `443` на твой ПК;
   - поставить reverse proxy, например Caddy или Nginx;
   - получить HTTPS-сертификат.

   В `.env` тогда будет:

   ```env
   WEB_APP_URL=https://your-domain.ru
   ```

2. **Белый динамический IP + DDNS**

   Подходит, если IP белый, но иногда меняется.

   Нужно:

   - настроить DDNS-домен;
   - пробросить порты `80` и `443`;
   - настроить HTTPS через reverse proxy.

3. **Постоянный tunnel**

   Это проще, чем настраивать роутер, но бесплатные tunnel-ссылки обычно меняются.

   Чтобы ссылка не менялась, нужен tunnel со статичным доменом. Обычно это требует аккаунт или платный тариф.

Для запуска на своем ПК в production-режиме:

```bash
npm.cmd run build
npm.cmd run start
```

После этого приложение работает на:

```text
http://localhost:3000
```

А наружу его должен отдавать HTTPS reverse proxy или постоянный tunnel.

Важно:

- ПК должен быть включен постоянно.
- Интернет должен быть стабильным.
- После перезагрузки ПК нужно снова запустить backend или настроить автозапуск.
- `BOT_TOKEN` нельзя публиковать в скриншотах или чатах.
