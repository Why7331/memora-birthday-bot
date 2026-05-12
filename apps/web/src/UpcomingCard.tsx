import { CalendarDays, Gift, Pencil } from 'lucide-react';
import { daysUntil, formatBirthdayDate, getAge } from './date';
import type { Birthday } from './types';

type UpcomingCardProps = {
  birthdays: Birthday[];
  upcoming: Birthday[];
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (birthday: Birthday) => void;
};

export function UpcomingCard({ birthdays, upcoming, isLoading, onCreate, onEdit }: UpcomingCardProps) {
  return (
    <section className="glass-panel upcoming-card floating-panel">
      <div className="section-heading">
        <h2>Ближайшие</h2>
        <span>{birthdays.length} всего</span>
      </div>

      {isLoading && <p className="soft-text">Загружаю календарь...</p>}

      {!isLoading && birthdays.length === 0 && (
        <div className="empty-state">
          <CalendarDays size={48} />
          <strong>Пока здесь пусто ✨</strong>
          <p>Добавьте первый день рождения, и Memora напомнит о нём вовремя.</p>
          <button className="empty-action" onClick={onCreate}>
            <Gift size={23} />
            <span>Добавить первый день рождения</span>
          </button>
        </div>
      )}

      <div className="upcoming-list">
        {upcoming.map((birthday) => {
          const dateParts = formatBirthdayDate(birthday.birth_date).split(' ');
          const until = daysUntil(birthday.birth_date);

          return (
            <article className="birthday-row" key={birthday.id}>
              <div className="date-pill">
                <strong>{dateParts[0]}</strong>
                <span>{dateParts[1]}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">{birthday.name}</h3>
                <p className="truncate text-sm text-slate-300/70">
                  {birthday.relation}
                  {getAge(birthday.birth_date) ? ` · ${getAge(birthday.birth_date)} лет` : ''}
                  {until === 0 ? ' · сегодня' : ` · через ${until} дн.`}
                </p>
                {birthday.gift_idea && <p className="gift-line truncate">{birthday.gift_idea}</p>}
              </div>
              <button className="round-action round-action-tiny" onClick={() => onEdit(birthday)} aria-label="Редактировать">
                <Pencil size={16} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
