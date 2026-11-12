/**
 * Utility functions for local dates, time display, and 9-hour work duration calculations.
 * Always respects the client's local timezone (Malaysia UTC+8).
 */

export function getLocalDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatLocalTime(isoOrTimeStr?: string | null): string {
  if (!isoOrTimeStr) return '-';
  if (/^\d{1,2}:\d{2}(:\d{2})?(\s?[AP]M)?$/i.test(isoOrTimeStr)) {
    return isoOrTimeStr;
  }
  try {
    const d = new Date(isoOrTimeStr);
    if (isNaN(d.getTime())) return isoOrTimeStr;
    return d.toLocaleTimeString('ms-MY', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return isoOrTimeStr;
  }
}

export function formatShortTime(isoOrTimeStr?: string | null): string {
  if (!isoOrTimeStr) return '-';
  if (/^\d{1,2}:\d{2}(\s?[AP]M)?$/i.test(isoOrTimeStr)) {
    return isoOrTimeStr;
  }
  try {
    const d = new Date(isoOrTimeStr);
    if (isNaN(d.getTime())) return isoOrTimeStr;
    return d.toLocaleTimeString('ms-MY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoOrTimeStr;
  }
}

export function formatDuration(minutes?: number): string {
  if (minutes === undefined || minutes === null || isNaN(minutes)) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}j ${mins}m`;
}

export function formatSecondsToHms(seconds: number): string {
  const safeSecs = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safeSecs / 3600);
  const m = Math.floor((safeSecs % 3600) / 60);
  const s = safeSecs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

