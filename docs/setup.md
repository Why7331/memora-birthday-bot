# Local Setup

This guide explains how to run Memora Birthday Bot locally.

## Requirements

- Node.js 22.x or newer
- npm
- Telegram account
- Telegram bot token from BotFather
- PostgreSQL connection string

For a free PostgreSQL database, Neon is enough for an MVP.

## 1. Install Dependencies

From the repository root:

```bash
npm install
```

On Windows PowerShell, if script execution blocks `npm`, use:

```bash
npm.cmd install
```

## 2. Create a Telegram Bot

1. Open Telegram.
2. Search for `@BotFather`.
3. Run `/newbot`.
4. Copy the bot token.

The token looks like this:

```text
123456:ABC-telegram-token-example
```

Do not commit the real token to GitHub.

## 3. Configure Environment Variables

Copy the example file:

```bash
copy .env.example .env
```

On Linux/macOS:

```bash
cp .env.example .env
```

Fill the important variables:

```env
NODE_ENV=development
PORT=3000
WEB_APP_URL=https://your-public-mini-app-url.example
BOT_TOKEN=your-bot-token
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
REMINDER_CRON=0 9 * * *
TIMEZONE=Europe/Moscow
VITE_ENABLE_TEST_REMINDER=false
```

## 4. Prepare PostgreSQL

The backend creates required tables automatically during startup.

Tables:

- `users`
- `birthdays`
- `sent_reminders`

If you use Neon, copy the full connection string with password and paste it into `DATABASE_URL`.

## 5. Seed Demo Data

Optional:

```bash
npm run seed
```

PowerShell alternative:

```bash
npm.cmd run seed
```

## 6. Run Development Servers

```bash
npm run dev
```

PowerShell alternative:

```bash
npm.cmd run dev
```

This starts both workspaces:

- API: `http://localhost:3000`
- Web frontend: `http://localhost:5173`

## 7. Open in Browser

You can open the frontend in a normal browser:

```text
http://localhost:5173
```

Full Telegram Mini App authorization works only inside Telegram, because Telegram provides signed WebApp `initData`.

## 8. Test Through Telegram

Telegram Mini Apps require a public HTTPS URL. `localhost` cannot be used directly inside Telegram.

For local development, one option is a temporary tunnel.

Build frontend and run backend serving the Mini App:

```bash
npm.cmd run telegram
```

Open a tunnel to port `3000`:

```bash
npm.cmd run tunnel
```

The tunnel gives a public HTTPS URL, for example:

```text
https://example.lhr.life
```

Set it in `.env`:

```env
WEB_APP_URL=https://example.lhr.life
```

Restart the backend:

```bash
npm.cmd run telegram
```

Now `/start` in the Telegram bot should show the Mini App button.

## Useful Scripts

```bash
npm run dev       # run API and frontend in development mode
npm run dev:api   # run only backend API
npm run dev:web   # run only frontend
npm run build     # build API and frontend
npm run start     # start built API
npm run seed      # insert demo data
npm run telegram  # build frontend and run backend for Telegram testing
npm run tunnel    # open temporary public tunnel to backend port 3000
```

## Common Issues

### PowerShell blocks npm scripts

Use `npm.cmd` instead of `npm`:

```bash
npm.cmd run dev
```

### Mini App opens in browser but not in Telegram

Check that `WEB_APP_URL` is a public HTTPS URL. Telegram will not open `localhost` as a Mini App URL.

### API returns authorization error

Open the app through Telegram. Browser-only mode does not provide valid Telegram `initData`.

### Reminders are not sent

Check:

- `BOT_TOKEN` is valid;
- the bot process is running;
- `REMINDER_CRON` is correct;
- `TIMEZONE` is correct;
- the birthday date matches today's month and day;
- the reminder was not already written to `sent_reminders`.
