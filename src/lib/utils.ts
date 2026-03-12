import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Xч Yм" or "Yм" from a raw minutes value. */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}ч ${m}м` : `${m}м`;
}

/** YYYY-MM-DD using the *local* timezone (avoids UTC-shift bugs). */
export function toLocalISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** YYYY-MM-DD for a date N days in the past (UTC-based, for DB queries). */
export function dateISO(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

/** Up to 2-letter initials from a display name or email address. */
export function getInitials(fullName?: string | null, email?: string | null): string {
  return (fullName || email || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
