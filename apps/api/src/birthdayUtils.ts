export function monthDay(birthDate: string) {
  const parts = birthDate.split('-');
  return `${parts[1]}-${parts[2]}`;
}

export function ageOnDate(birthDate: string, now = new Date()) {
  const [year] = birthDate.split('-').map(Number);
  if (!year) return null;
  return now.getFullYear() - year;
}

export function sortByNextBirthday<T extends { birth_date: string }>(items: T[], now = new Date()) {
  const currentYear = now.getFullYear();
  const today = new Date(currentYear, now.getMonth(), now.getDate()).getTime();

  return [...items].sort((a, b) => nextTime(a.birth_date) - nextTime(b.birth_date));

  function nextTime(birthDate: string) {
    const [, month, day] = birthDate.split('-').map(Number);
    const next = new Date(currentYear, month - 1, day);
    if (next.getTime() < today) next.setFullYear(currentYear + 1);
    return next.getTime();
  }
}
