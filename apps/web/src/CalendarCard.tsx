import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { birthdaysOnDate, buildCalendarDays, formatMonth } from './date';
import type { Birthday } from './types';

type CalendarCardProps = {
  birthdays: Birthday[];
  month: Date;
  onMonthChange: (month: Date) => void;
  onEditBirthday: (birthday: Birthday) => void;
};

export function CalendarCard({ birthdays, month, onMonthChange, onEditBirthday }: CalendarCardProps) {
  return (
    <section className="glass-panel calendar-card floating-panel">
      <div className="calendar-card-header">
        <button className="month-title" aria-label="Текущий месяц">
          <CalendarDays size={19} />
          <span>{formatMonth(month)}</span>
        </button>
        <div className="month-actions">
          <button className="round-action round-action-small" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Предыдущий месяц">
            <ChevronLeft size={22} />
          </button>
          <button className="round-action round-action-small" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Следующий месяц">
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <div className="weekday-grid">
        {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {buildCalendarDays(month).map((cell) => {
          const items = birthdaysOnDate(birthdays, cell.date);
          const isToday = new Date().toDateString() === cell.date.toDateString();

          return (
            <button
              key={cell.key}
              className={`calendar-day ${cell.inMonth ? '' : 'muted'} ${isToday ? 'today' : ''} ${items.length ? 'has-event' : ''}`}
              onClick={items[0] ? () => onEditBirthday(items[0]) : undefined}
            >
              <span>{cell.day}</span>
              {items.length > 0 && <i>{items.length}</i>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
