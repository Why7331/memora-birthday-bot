import type { NextFunction, Request, Response } from 'express';
import { config } from './config.js';
import { upsertUser, type DbUser } from './db.js';
import { verifyTelegramInitData } from './telegramAuth.js';

declare global {
  namespace Express {
    interface Request {
      currentUser?: DbUser;
    }
  }
}

export async function requireTelegramUser(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.header('authorization') ?? '';
    const initData = header.startsWith('tma ') ? header.slice(4) : req.header('x-telegram-init-data');

    const tgUser = initData ? verifyTelegramInitData(initData) : null;

    if (tgUser) {
      req.currentUser = await upsertUser({
        telegramId: tgUser.id,
        firstName: tgUser.first_name,
        username: tgUser.username
      });
      return next();
    }

    if (config.NODE_ENV !== 'production' && config.DEV_TELEGRAM_ID) {
      if (initData) {
        console.warn('Telegram initData verification failed. Using DEV_TELEGRAM_ID fallback because NODE_ENV is not production.');
      }

      req.currentUser = await upsertUser({
        telegramId: config.DEV_TELEGRAM_ID,
        firstName: 'Demo',
        username: 'demo_user'
      });
      return next();
    }

    return res.status(401).json({ error: 'Invalid Telegram WebApp initData' });
  } catch (error) {
    return next(error);
  }
}
