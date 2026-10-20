export function formatFileSize(bytes: number, lng?: string): string {
    const units = ['o', 'Ko', 'Mo', 'Go'];
    const unitsEn = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    const label = lng === 'fr' ? units[unit] : unitsEn[unit];
    return `${new Intl.NumberFormat(lng, { maximumFractionDigits: unit === 0 ? 0 : 1 }).format(value)} ${label}`;
}

export function formatNumber(value: number, lng?: string, digits = 1): string {
    return new Intl.NumberFormat(lng, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}
