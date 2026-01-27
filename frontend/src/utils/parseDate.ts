// parseDate.ts
// Utility to robustly parse date fields from string (YYYY-MM-DD, ISO) or number (timestamp)
export function parseDate(input: string | number | Date | undefined | null): Date | null {
    if (!input) return null;
    if (input instanceof Date) return input;
    if (typeof input === 'number') {
        // If it's a timestamp in ms or s
        if (input > 1e12) return new Date(input); // ms
        if (input > 1e9) return new Date(input * 1000); // s
        return null;
    }
    if (typeof input === 'string') {
        // Try ISO or YYYY-MM-DD
        const d = new Date(input);
        if (!isNaN(d.getTime())) return d;
    }
    return null;
}
