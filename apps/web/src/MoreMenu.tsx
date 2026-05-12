import { BellRing } from 'lucide-react';
import type { Ref } from 'react';

export const isTestReminderEnabled = import.meta.env.VITE_ENABLE_TEST_REMINDER === 'true';

type MoreMenuProps = {
  isOpen: boolean;
  isSending: boolean;
  menuRef: Ref<HTMLDivElement>;
  onSendTestReminder: () => void;
};

export function MoreMenu({ isOpen, isSending, menuRef, onSendTestReminder }: MoreMenuProps) {
  if (!isOpen || !isTestReminderEnabled) return null;

  return (
    <div className="glass-dropdown" ref={menuRef}>
      <button className="glass-dropdown-item" onClick={onSendTestReminder} disabled={isSending}>
        <BellRing size={18} />
        <span>{isSending ? 'Отправляю...' : 'Тестовое напоминание'}</span>
      </button>
    </div>
  );
}
