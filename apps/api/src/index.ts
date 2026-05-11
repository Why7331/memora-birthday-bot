import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { migrate } from './db.js';
import { router } from './routes.js';
import { bot, setupBotMenuButton } from './bot.js';
import { startScheduler } from './scheduler.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(router);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const webDistCandidates = [
  path.resolve(currentDir, '../../web/dist'),
  path.resolve(currentDir, '../../../web/dist')
];
const webDist = webDistCandidates.find((candidate) => fs.existsSync(path.join(candidate, 'index.html')));

if (webDist) {
  app.use(express.static(webDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(webDist, 'index.html'));
  });
} else {
  console.warn('Mini App static files not found. Run npm.cmd run build before exposing API port 3000.');
}

await migrate();

app.listen(config.PORT, () => {
  console.log(`API is running on http://localhost:${config.PORT}`);
});

if (bot) {
  setupBotMenuButton()
    .then(() => console.log('Telegram WebApp menu button is configured'))
    .catch((error) => console.error('Failed to configure Telegram menu button:', error));

  bot.launch(() => {
    console.log('Telegram bot is running');
  });
} else {
  console.warn('Telegram bot is disabled. Add BOT_TOKEN to .env to enable it.');
}

startScheduler();

process.once('SIGINT', () => bot?.stop('SIGINT'));
process.once('SIGTERM', () => bot?.stop('SIGTERM'));
