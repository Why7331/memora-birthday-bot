import { Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { GlassInput } from './GlassInput';
import { GlassToggle } from './GlassToggle';
import { LiquidButton } from './LiquidButton';
import type { Birthday, BirthdayForm } from './types';

type AddRelativeModalProps = {
  editing: Birthday | null;
  error: string;
  form: BirthdayForm;
  isOpen: boolean;
  yearKnown: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
  onFormChange: (form: BirthdayForm) => void;
  onSubmit: () => Promise<void>;
  onYearKnownChange: (value: boolean) => void;
};

export function AddRelativeModal({
  editing,
  error,
  form,
  isOpen,
  yearKnown,
  onClose,
  onDelete,
  onFormChange,
  onSubmit,
  onYearKnownChange
}: AddRelativeModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      return;
    }

    if (!shouldRender) return;
    setIsClosing(true);
    const timeout = window.setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit();
  };

  return (
    <div className={`modal-layer ${isClosing ? 'is-closing' : 'is-opening'}`} role="dialog" aria-modal="true" aria-label={editing ? 'Редактировать родственника' : 'Добавить родственника'}>
      <button className="modal-scrim" type="button" onClick={onClose} aria-label="Закрыть форму" />
      <form className="add-relative-sheet" onSubmit={submit}>
        <div className="sheet-liquid-reflection" />
        <div className="sheet-handle" />

        <div className="sheet-title">
          <div>
            <span className="sheet-kicker">Memora</span>
            <h2>{editing ? 'Редактировать' : 'Новый родственник'}</h2>
          </div>
          <button type="button" className="round-action round-action-small" onClick={onClose} aria-label="Закрыть">
            <X size={19} />
          </button>
        </div>

        <div className="form-grid">
          <GlassInput
            required
            label="Имя"
            value={form.name}
            onChange={(value) => onFormChange({ ...form, name: value })}
          />
          <GlassInput
            required
            label="Степень родства"
            value={form.relation}
            onChange={(value) => onFormChange({ ...form, relation: value })}
          />
          <GlassInput
            required
            label="Дата рождения"
            type="date"
            value={form.birth_date}
            onChange={(value) => onFormChange({ ...form, birth_date: value })}
          />
          <GlassToggle label="Год рождения известен" checked={yearKnown} onChange={onYearKnownChange} />
          <GlassInput
            label="Заметка"
            value={form.note}
            multiline
            onChange={(value) => onFormChange({ ...form, note: value })}
          />
          <GlassInput
            label="Идея подарка"
            value={form.gift_idea}
            multiline
            onChange={(value) => onFormChange({ ...form, gift_idea: value })}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          {editing && (
            <button type="button" className="danger-button" onClick={() => onDelete(editing.id)} aria-label="Удалить">
              <Trash2 size={18} />
            </button>
          )}
          <LiquidButton type="submit">{editing ? 'Сохранить' : 'Добавить'}</LiquidButton>
        </div>
      </form>
    </div>
  );
}
