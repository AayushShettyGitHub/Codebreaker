
/**
 * Parses a date string as UTC, handling cases where the 'Z' timezone pointer is missing.
 * @param {string|number} dateStr - The date string (ISO 8601) or timestamp.
 * @returns {number} - The epoch timestamp in milliseconds.
 */
export const parseAsUTC = (dateStr) => {
    if (!dateStr) return 0;

    // If it's already a number, assume epoch
    if (typeof dateStr === 'number') {
        // If it seems to be in seconds (e.g., < 100 billion), convert to ms
        if (dateStr < 100000000000) return dateStr * 1000;
        return dateStr;
    }

    // If it's a string
    if (typeof dateStr === 'string') {
        // If the string already indicates UTC (Z) or an offset (+/-), trust standard parsing
        if (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('-') && dateStr.lastIndexOf('-') > 10)) {
            return new Date(dateStr).getTime();
        }

        // Otherwise, assume it is clean UTC ISO-8601 but missing the 'Z'.
        // e.g. "2026-02-11T12:00:00" -> treat as "2026-02-11T12:00:00Z"
        return new Date(dateStr + 'Z').getTime();
    }

    // Fallback
    return new Date(dateStr).getTime();
};

/**
 * Returns the current time in UTC epoch milliseconds.
 * Equivalent to Date.now() but explicit for readability.
 */
export const getNowUTC = () => {
    return Date.now();
};
