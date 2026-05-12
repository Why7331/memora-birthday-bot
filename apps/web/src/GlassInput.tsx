import { ChangeEvent, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type GlassInputProps = {
  label: string;
  multiline?: boolean;
  onChange: (value: string) => void;
  value: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'>;

export function GlassInput({ label, multiline = false, onChange, value, ...props }: GlassInputProps) {
  const className = `glass-field ${value.length > 0 ? 'has-value' : ''}`;

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <label className={className}>
      {multiline ? (
        <textarea {...props} value={value} onChange={handleChange} placeholder=" " />
      ) : (
        <input {...props} value={value} onChange={handleChange} placeholder=" " />
      )}
      <span>{label}</span>
      <i aria-hidden="true" />
    </label>
  );
}
