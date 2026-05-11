import { CalendarDays, ChevronLeft, ChevronRight, Gift, Pencil, Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { api } from './api';
import {
  birthdaysOnDate,
  buildCalendarDays,
  daysUntil,
  formatBirthdayDate,
  formatMonth,
  fromInputBirthDate,
  getAge,
  toInputBirthDate
} from './date';
import { getTelegramWebApp, subscribeToTelegramTheme } from './telegram';
import type { Birthday, BirthdayForm } from './types';

const emptyForm: BirthdayForm = {
  name: '',
  relation: '',
  birth_date: new Date().toISOString().slice(0, 10),
  note: '',
  gift_idea: ''
};

function getInitialDarkMode() {
  const tgScheme = getTelegramWebApp()?.colorScheme;
  if (tgScheme) return tgScheme === 'dark';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function App() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [month, setMonth] = useState(() => new Date());
  const [isDark, setIsDark] = useState(getInitialDarkMode);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Birthday | null>(null);
  const [form, setForm] = useState<BirthdayForm>(emptyForm);
  const [yearKnown, setYearKnown] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const tg = getTelegramWebApp();
    tg?.ready();
    tg?.expand();

    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const syncTheme = () => {
      const telegramScheme = getTelegramWebApp()?.colorScheme;
      setIsDark(telegramScheme ? telegramScheme === 'dark' : media?.matches ?? false);
    };

    syncTheme();
    const unsubscribeTelegram = subscribeToTelegramTheme(syncTheme);
    media?.addEventListener('change', syncTheme);
    loadBirthdays();

    return () => {
      unsubscribeTelegram();
      media?.removeEventListener('change', syncTheme);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const upcoming = useMemo(
    () => [...birthdays].sort((a, b) => daysUntil(a.birth_date) - daysUntil(b.birth_date)).slice(0, 5),
    [birthdays]
  );

  async function loadBirthdays() {
    try {
      setError('');
      const response = await api.birthdays();
      setBirthdays(response.birthdays);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить данные');
    } finally {
      setIsLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setYearKnown(true);
    setFormError('');
    setIsSheetOpen(true);
  }

  function openEdit(birthday: Birthday) {
    setEditing(birthday);
    setForm({
      name: birthday.name,
      relation: birthday.relation,
      birth_date: toInputBirthDate(birthday.birth_date),
      note: birthday.note ?? '',
      gift_idea: birthday.gift_idea ?? ''
    });
    setYearKnown(!birthday.birth_date.startsWith('0000'));
    setFormError('');
    setIsSheetOpen(true);
  }

  async function submitForm(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    const payload = {
      ...form,
      birth_date: fromInputBirthDate(form.birth_date, yearKnown)
    };

    try {
      if (editing) {
        await api.updateBirthday(editing.id, payload);
      } else {
        await api.createBirthday(payload);
      }

      setIsSheetOpen(false);
      await loadBirthdays();
    } catch (requestError) {
      setFormError(requestError instanceof Error ? requestError.message : 'Не удалось сохранить запись');
    }
  }

  async function removeBirthday(id: number) {
    await api.deleteBirthday(id);
    setIsSheetOpen(false);
    await loadBirthdays();
  }

  return (
    <main className="app-shell min-h-screen overflow-hidden text-slate-950 transition-colors dark:text-white">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-4 pb-6 pt-[max(18px,env(safe-area-inset-top))]">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-white/62">Семейный календарь</p>
            <h1 className="text-3xl font-semibold tracking-normal">Дни рождения</h1>
          </div>
          <button className="icon-button primary" onClick={openCreate} aria-label="Добавить родственника">
            <Plus size={22} />
          </button>
        </header>

        <section className="glass-panel floating-panel p-4">
          <div className="mb-4 flex items-center justify-between">
            <button className="icon-button small" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Предыдущий месяц">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays size={19} />
              {formatMonth(month)}
            </div>
            <button className="icon-button small" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Следующий месяц">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-semibold uppercase text-slate-500 dark:text-white/45">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {buildCalendarDays(month).map((cell) => {
              const items = birthdaysOnDate(birthdays, cell.date);
              const isToday = new Date().toDateString() === cell.date.toDateString();

              return (
                <button key={cell.key} className={`calendar-day ${cell.inMonth ? '' : 'muted'} ${isToday ? 'today' : ''}`} onClick={items[0] ? () => openEdit(items[0]) : undefined}>
                  <span>{cell.day}</span>
                  {items.length > 0 && <i>{items.length}</i>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass-panel floating-panel flex-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Ближайшие</h2>
            <span className="text-sm text-slate-600 dark:text-white/55">{birthdays.length} всего</span>
          </div>

          {isLoading && <p className="soft-text">Загружаю календарь...</p>}
          {error && <p className="rounded-3xl bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-200">{error}</p>}
          {!isLoading && birthdays.length === 0 && (
            <button className="empty-state" onClick={openCreate}>
              <Gift size={28} />
              <span>Добавить первый день рождения</span>
            </button>
          )}

          <div className="space-y-3">
            {upcoming.map((birthday) => (
              <article className="birthday-row" key={birthday.id}>
                <div className="date-pill">
                  <strong>{formatBirthdayDate(birthday.birth_date).split(' ')[0]}</strong>
                  <span>{formatBirthdayDate(birthday.birth_date).split(' ')[1]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{birthday.name}</h3>
                  <p className="truncate text-sm text-slate-600 dark:text-white/55">
                    {birthday.relation}
                    {getAge(birthday.birth_date) ? ` · ${getAge(birthday.birth_date)} лет` : ''}
                    {daysUntil(birthday.birth_date) === 0 ? ' · сегодня' : ` · через ${daysUntil(birthday.birth_date)} дн.`}
                  </p>
                </div>
                <button className="icon-button small" onClick={() => openEdit(birthday)} aria-label="Редактировать">
                  <Pencil size={17} />
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>

      {isSheetOpen && (
        <div className="sheet-backdrop">
          <form className="sheet glass-panel" onSubmit={submitForm}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{editing ? 'Редактировать' : 'Новый родственник'}</h2>
              <button type="button" className="icon-button small" onClick={() => setIsSheetOpen(false)} aria-label="Закрыть">
                <X size={19} />
              </button>
            </div>

            <label>
              Имя
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Например, Анна" />
            </label>
            <label>
              Степень родства
              <input required value={form.relation} onChange={(event) => setForm({ ...form, relation: event.target.value })} placeholder="Мама, брат, бабушка" />
            </label>
            <label>
              Дата рождения
              <input required type="date" value={form.birth_date} onChange={(event) => setForm({ ...form, birth_date: event.target.value })} />
            </label>
            <label className="toggle-row">
              <input type="checkbox" checked={yearKnown} onChange={(event) => setYearKnown(event.target.checked)} />
              Год рождения известен
            </label>
            <label>
              Заметка
              <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Что важно помнить" />
            </label>
            <label>
              Идея подарка
              <textarea value={form.gift_idea} onChange={(event) => setForm({ ...form, gift_idea: event.target.value })} placeholder="Что можно подарить" />
            </label>

            {formError && <p className="form-error">{formError}</p>}

            <div className="mt-4 flex gap-2">
              {editing && (
                <button type="button" className="danger-button" onClick={() => removeBirthday(editing.id)}>
                  <Trash2 size={18} />
                </button>
              )}
              <button className="save-button" type="submit">{editing ? 'Сохранить' : 'Добавить'}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
