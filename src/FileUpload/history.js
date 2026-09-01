export const STORAGE_KEY = "seekpath.parsedStructures";
export const MAX_HISTORY = 50;

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
    return true;
  } catch {
    return false;
  }
}

export function addHistoryEntry(entry) {
  const entries = loadHistory();
  const next = [entry, ...entries.filter((e) => e.id !== entry.id)].slice(
    0,
    MAX_HISTORY
  );
  saveHistory(next);
  return next;
}

export function removeHistoryEntry(id) {
  const entries = loadHistory().filter((e) => e.id !== id);
  saveHistory(entries);
  return entries;
}

export function clearHistory() {
  saveHistory([]);
  return [];
}