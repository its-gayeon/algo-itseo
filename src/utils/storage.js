let currentUser = localStorage.getItem("username") || "anonymous";

export function setStorageUser(username) {
  currentUser = username || "anonymous";
}

function getKey(baseKey) {
  return `${baseKey}_${currentUser}`;
}

export const STORAGE_KEYS = {
  problems: "ipdash_problems",
  streak: "ipdash_streak",
  lastDate: "ipdash_last_date",
  interviewDate: "ipdash_interview_date",
  logs: "ipdash_logs",
};

export function getStoredNumber(key, fallback = 0) {
  return Number(localStorage.getItem(getKey(key))) || fallback;
}

export function getStoredString(key, fallback = "") {
  return localStorage.getItem(getKey(key)) || fallback;
}

export function setStoredValue(key, value) {
  localStorage.setItem(getKey(key), value);
}

export function getLogs() {
  try { return JSON.parse(localStorage.getItem(getKey(STORAGE_KEYS.logs))) || []; }
  catch { return []; }
}

export function isSolvedToday() {
  const today = new Date().toISOString().slice(0, 10);
  if (getStoredString(STORAGE_KEYS.lastDate) === today) return true;
  return getLogs().some(l => l.date.startsWith(today));
}

export function getCurrentStreak() {
  const logs = getLogs();
  const dates = new Set(logs.map(l => l.date.slice(0, 10)));
  const manualLastDate = getStoredString(STORAGE_KEYS.lastDate);
  if (manualLastDate) dates.add(manualLastDate);

  const sortedDates = [...dates].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (!sortedDates.includes(today) && !sortedDates.includes(yesterday)) {
    return 0;
  }

  let currentStreak = 0;
  let checkTime = sortedDates.includes(today) ? Date.now() : Date.now() - 86400000;

  while (true) {
    const dStr = new Date(checkTime).toISOString().slice(0, 10);
    if (sortedDates.includes(dStr)) {
      currentStreak++;
      checkTime -= 86400000;
    } else {
      break;
    }
  }

  return currentStreak;
}

export function addLog(entry) {
  const logs = getLogs();
  logs.unshift({ ...entry, id: Date.now(), date: new Date().toISOString() });
  localStorage.setItem(getKey(STORAGE_KEYS.logs), JSON.stringify(logs));
  return logs;
}

export function updateLog(id, patch) {
  const logs = getLogs().map(l => l.id === id ? { ...l, ...patch } : l);
  localStorage.setItem(getKey(STORAGE_KEYS.logs), JSON.stringify(logs));
  return logs;
}

export function deleteLog(id) {
  const logs = getLogs().filter(l => l.id !== id);
  localStorage.setItem(getKey(STORAGE_KEYS.logs), JSON.stringify(logs));
  return logs;
}

export function getTodayLogCount() {
  const today = new Date().toISOString().slice(0, 10);
  return getLogs().filter(l => l.date.startsWith(today)).length;
}
