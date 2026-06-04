export function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function getDday(target) {
  if (!target) return null;
  return Math.ceil((new Date(target) - new Date().setHours(0, 0, 0, 0)) / 86400000);
}

export function formatDday(target) {
  const dday = getDday(target);

  if (dday === null) return "Set date";
  if (dday > 0) return `D-${dday}`;
  if (dday === 0) return "Today";
  return `D+${Math.abs(dday)}`;
}
