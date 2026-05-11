import type { Birthday } from './types';

const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
const dayFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

export function formatMonth(date: Date) {
  return capitalize(monthFormatter.format(date));
}

export function formatBirthdayDate(birthDate: string) {
  const [, month, day] = birthDate.split('-').map(Number);
  return dayFormatter.format(new Date(2024, month - 1, day));
}

export function getAge(birthDate: string, now = new Date()) {
  const [year] = birthDate.split('-').map(Number);
  if (!year) return null;
  return now.getFullYear() - year;
}

export function monthDay(birthDate: string) {
  return birthDate.slice(5);
}

export function daysUntil(birthDate: string, now = new Date()) {
  const [, month, day] = birthDate.split('-').map(Number);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const next = new Date(now.getFullYear(), month - 1, day);
  if (next < today) next.setFullYear(now.getFullYear() + 1);
  return Math.round((next.getTime() - today.getTime()) / 86400000);
}

export function buildCalendarDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, monthIndex, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      key: toDateKey(date),
      inMonth: date.getMonth() === monthIndex,
      day: date.getDate()
    };
  });
}

export function birthdaysOnDate(birthdays: Birthday[], date: Date) {
  const key = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return birthdays.filter((birthday) => monthDay(birthday.birth_date) === key);
}

export function toInputBirthDate(birthDate: string) {
  return birthDate.startsWith('0000') ? `2000-${birthDate.slice(5)}` : birthDate;
}

export function fromInputBirthDate(input: string, yearKnown: boolean) {
  return yearKnown ? input : `0000-${input.slice(5)}`;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
