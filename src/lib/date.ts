/**
 * Date utilities — all dates in EST/EDT (America/New_York).
 * Ensures articles generated at 11pm EST don't get tomorrow's UTC date.
 */

const TZ = 'America/New_York';

/** Current date in EST as YYYY-MM-DD */
export function todayEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}

/** Current ISO timestamp in EST (e.g. 2026-03-09T23:15:00.000-04:00) */
export function nowEST(): string {
  const now = new Date();
  const estStr = now.toLocaleString('en-US', { timeZone: TZ, hour12: false });
  const [datePart, timePart] = estStr.split(', ');
  const [month, day, year] = datePart.split('/');
  const pad = (n: string) => n.padStart(2, '0');
  // Get UTC offset for EST/EDT
  const utc = now.getTime();
  const est = new Date(now.toLocaleString('en-US', { timeZone: TZ }));
  const offsetMs = utc - est.getTime();
  const offsetHrs = Math.round(offsetMs / 3600000);
  const sign = offsetHrs <= 0 ? '+' : '-';
  const absHrs = String(Math.abs(offsetHrs)).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}T${timePart}.000${sign}${absHrs}:00`;
}
