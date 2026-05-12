import { CalendarDays, Plus, Users } from 'lucide-react';

export type AppTab = 'calendar' | 'people';

type BottomNavigationProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onCreate: () => void;
};

export function BottomNavigation({ activeTab, onTabChange, onCreate }: BottomNavigationProps) {
  return (
    <nav className="bottom-navigation" aria-label="Основная навигация">
      <div className="bottom-tray">
        <button className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => onTabChange('calendar')}>
          <CalendarDays size={27} />
          <span>Календарь</span>
        </button>
        <button className="nav-create" onClick={onCreate} aria-label="Добавить день рождения">
          <Plus size={34} />
        </button>
        <button className={`nav-item ${activeTab === 'people' ? 'active' : ''}`} onClick={() => onTabChange('people')}>
          <Users size={29} />
          <span>Люди</span>
        </button>
      </div>
    </nav>
  );
}
