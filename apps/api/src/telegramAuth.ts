import crypto from 'node:crypto';
import { config } from './config.js';

export type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  username?: string;
};

export function verifyTelegramInitData(initData: string): TelegramWebAppUser | null {
  if (!config.BOT_TOKEN) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secret = crypto.createHmac('sha256', 'WebAppData').update(config.BOT_TOKEN).digest();
  const calculatedHash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(hash))) return null;

  const userRaw = params.get('user');
  if (!userRaw) return null;

  try {
    const user = JSON.parse(userRaw) as TelegramWebAppUser;
    return typeof user.id === 'number' ? user : null;
  } catch {
    return null;
  }
}
