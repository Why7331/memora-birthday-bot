import { Gift, MoreHorizontal, Search, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatedLiquidBackground } from './AnimatedLiquidBackground';
import { BottomNavigation, type AppTab } from './BottomNavigation';
import { CalendarCard } from './CalendarCard';
import { UpcomingCard } from './UpcomingCard';
import { api } from './api';
import { daysUntil, fromInputBirthDate, getAge, toInputBirthDate } from './date';
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
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
}

function isTelegramAuthError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return error.message.includes('Invalid Telegram WebApp initData');
}

export function App() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [month, setMonth] = useState(() => new Date());
  const [activeTab, setActiveTab] = useState<AppTab>('calendar');
  const [isDark, setIsDark] = useState(getInitialDarkMode);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Birthday | null>(null);
  const [form, setForm] = useState<BirthdayForm>(emptyForm);
  const [yearKnown, setYearKnown] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [softNotice, setSoftNotice] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const tg = getTelegramWebApp();
    tg?.ready();
    tg?.expand();
    tg?.MainButton?.hide();

    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const syncTheme = () => {
      const telegramScheme = getTelegramWebApp()?.colorScheme;
      setIsDark(telegramScheme ? telegramScheme === 'dark' : media?.matches ?? true);
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

  const people = useMemo(
    () => [...birthdays].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [birthdays]
  );

  async function loadBirthdays() {
    try {
      setError('');
      setSoftNotice('');
      const response = await api.birthdays();
      setBirthdays(response.birthdays);
    } catch (requestError) {
      if (isTelegramAuthError(requestError)) {
        if (import.meta.env.DEV) console.error(requestError);
        setSoftNotice('Откройте приложение через Telegram');
      } else {
        setError(requestError instanceof Error ? requestError.message : 'Не удалось загрузить данные');
      }
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
      if (isTelegramAuthError(requestError)) {
        if (import.meta.env.DEV) console.error(requestError);
        setFormError('Откройте приложение через Telegram');
      } else {
        setFormError(requestError instanceof Error ? requestError.message : 'Не удалось сохранить запись');
      }
    }
  }

  async function removeBirthday(id: number) {
    await api.deleteBirthday(id);
    setIsSheetOpen(false);
    await loadBirthdays();
  }

  return (
    <main className="app-shell min-h-screen overflow-hidden text-white">
      <AnimatedLiquidBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-36 pt-[max(22px,env(safe-area-inset-top))]">
        <header className="top-bar">
          <div className="memora-mark" aria-label="Memora">
            <span>M</span>
            <i />
          </div>
          <div className="top-actions">
            <button className="round-action" aria-label="Поиск">
              <Search size={23} />
            </button>
            <button className="round-action" aria-label="Меню">
              <MoreHorizontal size={25} />
            </button>
          </div>
        </header>

        {softNotice && <p className="soft-notice">{softNotice}</p>}
        {error && !softNotice && <p className="soft-notice soft-notice-error">{error}</p>}

        {activeTab === 'calendar' ? (
          <div className="screen-stack">
            <CalendarCard
              birthdays={birthdays}
              month={month}
              onMonthChange={setMonth}
              onEditBirthday={openEdit}
            />
            <UpcomingCard
              birthdays={birthdays}
              isLoading={isLoading}
              upcoming={upcoming}
              onCreate={openCreate}
              onEdit={openEdit}
            />
          </div>
        ) : (
          <section className="glass-panel people-card floating-panel">
            <div className="section-heading">
              <h2>Люди</h2>
              <span>{birthdays.length} всего</span>
            </div>

            {!isLoading && people.length === 0 ? (
              <div className="empty-state empty-state-compact">
                <Gift size={34} />
                <strong>Пока никого нет</strong>
                <p>Добавьте первый день рождения через кнопку +</p>
              </div>
            ) : (
              <div className="people-list">
                {people.map((birthday) => (
                  <button className="person-row" key={birthday.id} onClick={() => openEdit(birthday)}>
                    <span className="avatar-initial">{birthday.name.slice(0, 1).toUpperCase()}</span>
                    <span className="person-copy">
                      <strong>{birthday.name}</strong>
                      <small>
                        {birthday.relation}
                        {getAge(birthday.birth_date) ? ` · ${getAge(birthday.birth_date)} лет` : ''}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} onCreate={openCreate} />

      {isSheetOpen && (
        <div className="sheet-backdrop">
          <form className="sheet glass-panel" onSubmit={submitForm}>
            <div className="sheet-title">
              <h2>{editing ? 'Редактировать' : 'Новый родственник'}</h2>
              <button type="button" className="round-action round-action-small" onClick={() => setIsSheetOpen(false)} aria-label="Закрыть">
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

            <div className="form-actions">
              {editing && (
                <button type="button" className="danger-button" onClick={() => removeBirthday(editing.id)} aria-label="Удалить">
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
