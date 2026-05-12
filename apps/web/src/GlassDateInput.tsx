import { CalendarDays } from 'lucide-react';
import { InputHTMLAttributes } from 'react';

type GlassDateInputProps = {
  label: string;
  onChange: (value: string) => void;
  value: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value'>;

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

export function GlassDateInput({ label, onChange, value, ...props }: GlassDateInputProps) {
  const displayValue = formatDisplayDate(value);

  return (
    <label className="glass-date-field has-value">
      <input
        {...props}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      />
      <span>{label}</span>
      <strong>{displayValue}</strong>
      <CalendarDays size={17} aria-hidden="true" />
      <i aria-hidden="true" />
    </label>
  );
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return '';
  return dateFormatter.format(new Date(year, month - 1, day));
}
