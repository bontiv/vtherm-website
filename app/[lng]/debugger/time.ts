export type TimeZoneMode = 'UTC' | 'local';

/**
 * Parse a log timestamp ("2026-10-20 11:03:43.110").
 * Log timestamps carry no zone: the caller tells how to interpret them
 * (UTC when the VTherm export header says so, local time otherwise).
 */
export function parseTimestamp(str: string, tz: TimeZoneMode): Date {
    const iso = str.trim().replace(' ', 'T');
    return new Date(tz === 'UTC' ? iso + 'Z' : iso);
}

type FormatOptions = {
    tz: TimeZoneMode,
    lng?: string,
    withDate?: boolean,
    withSeconds?: boolean,
    withMs?: boolean,
}

/** Format a date for display, either in UTC or in the browser time zone */
export function formatTime(date: Date | number, { tz, lng, withDate = false, withSeconds = true, withMs = false }: FormatOptions): string {
    const d = typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(lng, {
        timeZone: tz === 'UTC' ? 'UTC' : undefined,
        hourCycle: 'h23',
        ...(withDate ? { day: '2-digit', month: '2-digit', year: 'numeric' } : {}),
        hour: '2-digit',
        minute: '2-digit',
        ...(withSeconds ? { second: '2-digit' } : {}),
        ...(withMs ? { fractionalSecondDigits: 3 } : {}),
    }).format(d);
}

/** Human readable duration ("1 h 00", "38 min 40 s") */
export function formatDuration(ms: number): string {
    const total = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h} h ${String(m).padStart(2, '0')}`;
    if (m > 0) return `${m} min ${String(s).padStart(2, '0')} s`;
    return `${s} s`;
}
