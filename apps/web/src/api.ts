import { getAuthHeaders } from './telegram';
import type { Birthday, BirthdayForm, Me } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? '';

function normalizeApiError(response: Response, message: string) {
  if (
    response.status === 401 ||
    message.includes('Invalid Telegram WebApp initData') ||
    message.includes('Откройте Memora через Telegram')
  ) {
    return 'Откройте Memora через Telegram';
  }

  return message || 'Что-то пошло не так. Попробуйте открыть приложение ещё раз.';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  for (const [key, value] of Object.entries(getAuthHeaders())) {
    headers.set(key, value);
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Что-то пошло не так. Попробуйте открыть приложение ещё раз.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    const rawMessage = await response.text();
    let message = rawMessage;

    try {
      const parsed = JSON.parse(rawMessage) as { error?: string };
      message = parsed.error ?? rawMessage;
    } catch {
      message = rawMessage;
    }

    throw new Error(normalizeApiError(response, message));
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  me: () => request<Me>('/api/me'),
  birthdays: () => request<{ birthdays: Birthday[] }>('/api/birthdays'),
  createBirthday: (payload: BirthdayForm) =>
    request<{ birthday: Birthday }>('/api/birthdays', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateBirthday: (id: number, payload: BirthdayForm) =>
    request<{ birthday: Birthday }>(`/api/birthdays/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteBirthday: (id: number) =>
    request<void>(`/api/birthdays/${id}`, {
      method: 'DELETE'
    })
};
