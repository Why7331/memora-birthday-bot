# Deployment

Memora Birthday Bot can be deployed in two main ways:

- Render + Neon for a simple MVP deployment
- Custom server + PM2 + GitHub Actions for a more controlled setup

## Required Production Variables

```env
NODE_ENV=production
PORT=10000
BOT_TOKEN=your-telegram-bot-token
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
WEB_APP_URL=https://your-public-app-url.example
REMINDER_CRON=0 9 * * *
TIMEZONE=Europe/Moscow
VITE_ENABLE_TEST_REMINDER=false
```

Do not store real secrets in Git.

## Option 1: Render + Neon

This is the simplest hosted MVP setup.

### 1. Create Neon Database

1. Create a Neon project.
2. Copy the PostgreSQL connection string.
3. Use it as `DATABASE_URL`.

The backend creates required tables on startup.

### 2. Create Render Web Service

1. Connect this GitHub repository to Render.
2. Create a new Web Service.
3. Render can use `render.yaml` from the repository root.

Current `render.yaml` configures:

- Node runtime;
- free plan;
- build command: `npm install && npm run build`;
- start command: `npm run start`;
- health check path: `/health`.

### 3. Add Environment Variables

In Render, add:

```env
NODE_ENV=production
NODE_VERSION=22
PORT=10000
BOT_TOKEN=your-token
DATABASE_URL=postgresql://...
WEB_APP_URL=https://your-render-service.onrender.com
REMINDER_CRON=0 9 * * *
TIMEZONE=Europe/Moscow
```

### 4. Configure Telegram Mini App URL

After Render gives the public URL, set the same URL in two places:

- Render environment variable `WEB_APP_URL`
- BotFather Mini App URL / bot web app settings

Then restart the Render service.

### Render Free Tier Limitation

Render free services can sleep after inactivity. If the service sleeps, scheduled reminders may not run exactly on time.

For a portfolio MVP this is acceptable. For real production reminders, use a paid always-on service or a custom server.

## Option 2: Custom Server + PM2

The repository includes `ecosystem.config.cjs` for PM2.

Expected server path:

```text
/opt/memora-birthday-bot
```

Basic deployment flow:

```bash
git clone https://github.com/Why7331/memora-birthday-bot.git /opt/memora-birthday-bot
cd /opt/memora-birthday-bot
npm install
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

The backend serves the built frontend from `apps/web/dist`, so one Node.js process can serve the API and Mini App static files.

## GitHub Actions Deployment

The workflow file is located at:

```text
.github/workflows/deploy.yml
```

It runs after push to `master` and connects to the server over SSH.

Required GitHub repository secrets:

```text
SERVER_HOST
SERVER_USER
SERVER_SSH_KEY
SERVER_PORT
```

The workflow executes:

```bash
cd /opt/memora-birthday-bot
git fetch origin master
git reset --hard origin/master
npm install
npm run build
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
```

## Home Hosting Notes

Telegram Mini Apps require a public HTTPS URL.

A local PC can host the app only if it is reachable from the internet through one of these setups:

- static public IP + domain + reverse proxy;
- dynamic public IP + DDNS + reverse proxy;
- persistent tunnel with a stable HTTPS domain.

For reverse proxy, use Nginx or Caddy. The proxy should forward HTTPS traffic to the Node.js backend port.

## Production Checklist

Before showing the project as a deployed demo:

- [ ] production `BOT_TOKEN` is valid;
- [ ] `DATABASE_URL` points to the production database;
- [ ] `WEB_APP_URL` is a real HTTPS URL;
- [ ] BotFather uses the same Mini App URL;
- [ ] `/health` returns `{ "ok": true }`;
- [ ] `/start` opens the Mini App button;
- [ ] a birthday can be created and edited;
- [ ] reminders work in the expected timezone;
- [ ] no secrets are visible in GitHub, screenshots, or logs.
