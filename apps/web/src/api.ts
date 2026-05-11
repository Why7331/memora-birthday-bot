import { getAuthHeaders } from './telegram';
import type { Birthday, BirthdayForm, Me } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? '';

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
      throw new Error('API не отвечает. Проверь, что npm.cmd run dev запущен и backend работает на localhost:3000.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
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
