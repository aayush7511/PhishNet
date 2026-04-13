import { useState } from 'react';

const TODAY_KEY = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `phishnet_scan_count_${y}-${m}-${day}`;
};

const LAST_SCAN_KEY = 'phishnet_last_scan';

/**
 * Hook that reads/writes the two localStorage stats displayed on the InputScreen:
 *  - scanCountToday: integer, increments per completed scan, resets per day
 *  - lastScan: { score, timestamp } | null
 *
 * Returns { lastScan, scanCountToday, recordScan }
 */
export function useScanStats() {
  const [scanCountToday, setScanCountToday] = useState(() => {
    const raw = localStorage.getItem(TODAY_KEY());
    return raw ? parseInt(raw, 10) : 0;
  });

  const [lastScan, setLastScan] = useState(() => {
    try {
      const raw = localStorage.getItem(LAST_SCAN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  /**
   * Record a completed scan — updates both localStorage keys and local state.
   * @param {number} score
   */
  function recordScan(score) {
    const key = TODAY_KEY();
    const newCount = (parseInt(localStorage.getItem(key) || '0', 10)) + 1;
    localStorage.setItem(key, String(newCount));
    setScanCountToday(newCount);

    const record = { score, timestamp: new Date().toISOString() };
    localStorage.setItem(LAST_SCAN_KEY, JSON.stringify(record));
    setLastScan(record);
  }

  return { lastScan, scanCountToday, recordScan };
}
