# Architecture

Memora Birthday Bot consists of four main parts:

- Telegram bot
- Telegram Mini App frontend
- Express backend API
- PostgreSQL database

A scheduled reminder worker runs inside the backend process through `node-cron`.

## High-Level Flow

```text
Telegram User
    |
    v
Telegram Bot
    |
    | opens Mini App
    v
React Mini App
    |
    | REST API requests with Telegram initData
    v
Express API
    |
    v
PostgreSQL

node-cron -> query today's birthdays -> Telegram reminder
```

## Runtime Components

### Telegram Bot

File: `apps/api/src/bot.ts`

Responsibilities:

- handles `/start`, `/help`, and `/app` commands;
- creates the Mini App button;
- configures Telegram menu button;
- stores or updates Telegram user data on `/start`;
- sends short service messages to the user.

The bot is disabled when `BOT_TOKEN` is not set. This makes local backend development possible without a Telegram token.

### Telegram Mini App

Main file: `apps/web/src/App.tsx`

Responsibilities:

- shows the birthday calendar;
- shows upcoming birthdays;
- opens the add/edit birthday modal;
- sends API requests to the backend;
- passes Telegram WebApp `initData` in the request authorization header;
- adapts to Telegram dark/light theme when possible.

### Express API

Main files:

- `apps/api/src/index.ts`
- `apps/api/src/routes.ts`
- `apps/api/src/authMiddleware.ts`
- `apps/api/src/telegramAuth.ts`

Responsibilities:

- starts the HTTP server;
- exposes the health check endpoint;
- serves built Mini App static files in production;
- verifies Telegram WebApp `initData`;
- exposes birthday CRUD routes;
- validates request bodies with `zod`;
- returns only the current user's records.

### PostgreSQL

Main file: `apps/api/src/db.ts`

Tables:

- `users` - Telegram users who opened the bot or Mini App
- `birthdays` - birthday records linked to users
- `sent_reminders` - daily reminder delivery log

The project creates the required tables automatically during backend startup through `migrate()`.

## Authentication Model

Telegram Mini App sends signed `initData` to the backend:

```text
Authorization: tma <initData>
```

The backend recalculates the Telegram hash using `BOT_TOKEN`. If the signature is invalid, the API returns an authentication error.

After verification, the backend extracts the Telegram user id, creates or updates the local user row, and attaches the current user to the request.

Important rule: the client does not choose `user_id`. The backend gets it from verified Telegram data.

## Data Isolation

Birthday records are always queried with the current backend user id:

```sql
SELECT * FROM birthdays WHERE user_id = $1
```

Update and delete operations also include `user_id` in the condition. This prevents one Telegram user from reading or changing another user's birthday records.

## Reminder Flow

File: `apps/api/src/scheduler.ts`

1. `node-cron` runs on `REMINDER_CRON` in `TIMEZONE`.
2. Backend reads birthdays joined with Telegram users.
3. The scheduler compares today's month/day with each stored birthday.
4. Before sending, it checks `sent_reminders`.
5. The bot sends a Telegram message.
6. The reminder is written to `sent_reminders` to prevent duplicates.

## Production Serving

In production, the frontend is built into `apps/web/dist`. The API process tries to serve this static build from the backend.

This allows one hosted web service to handle:

- API routes;
- Telegram bot runtime;
- scheduler runtime;
- Mini App static files.

## Main Tradeoffs

This is an MVP architecture. It is intentionally simple:

- one backend process runs API, bot, and scheduler;
- database migrations are basic and run during startup;
- the scheduler is process-local;
- Render free tier can sleep, so reminders are not guaranteed there.

For a production-grade version, the scheduler could be moved to a separate worker, migrations could be handled by a migration tool, and monitoring/logging could be expanded.
