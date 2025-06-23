/**
 * Date utility functions for consistent date formatting across the application
 */

/**
 * Format a date string to a human-readable format in user's local timezone
 * @param {string} dateString - ISO date string from the API (assumed to be UTC+0)
 * @param {Object} options - Optional formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
    if (!dateString) return options.fallback || 'N/A';
    
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const formatOptions = { ...defaultOptions, ...options.format };
    
    try {
        // Handle server dates that may not have timezone indicators
        let processedDateString = dateString;
        
        // If the date string doesn't end with 'Z' or timezone offset, assume it's UTC
        if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
            processedDateString = dateString.replace(/(\.\d{6}|\.\d{3})?$/, '') + 'Z';
        }
        
        // Parse the UTC date and format it in user's local timezone
        return new Date(processedDateString).toLocaleString(undefined, formatOptions);
    } catch (error) {
        console.error('Error formatting date:', error);
        return options.fallback || 'Invalid Date';
    }
};

/**
 * Format a date string to a compact format (for tables/lists)
 * @param {string} dateString - ISO date string from the API (assumed to be UTC+0)
 * @returns {string} Formatted date string
 */
export const formatDateCompact = (dateString) => {
    return formatDate(dateString, {
        format: {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        },
        fallback: 'N/A'
    });
};

/**
 * Format a date string for last login display
 * @param {string} dateString - ISO date string from the API (assumed to be UTC+0)
 * @returns {string} Formatted date string or "Never" if no date
 */
export const formatLastLogin = (dateString) => {
    return formatDate(dateString, {
        fallback: 'Never'
    });
};

/**
 * Format a number with locale-specific thousand separators
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return '0';
    return number.toLocaleString();
};

/**
 * Get relative time from now (e.g., "2 hours ago", "3 days ago")
 * @param {string} dateString - ISO date string from the API
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        
        // For older dates, just return the formatted date
        return formatDateCompact(dateString);
    } catch (error) {
        console.error('Error calculating relative time:', error);
        return 'Unknown';
    }
};

/**
 * Check if a date is today
 * @param {string} dateString - ISO date string from the API
 * @returns {boolean} True if the date is today
 */
export const isToday = (dateString) => {
    if (!dateString) return false;
    
    try {
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    } catch (error) {
        return false;
    }
};

/**
 * Check if a date is within the last N days
 * @param {string} dateString - ISO date string from the API
 * @param {number} days - Number of days to check
 * @returns {boolean} True if the date is within the last N days
 */
export const isWithinLastDays = (dateString, days = 7) => {
    if (!dateString) return false;
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        return diffInDays <= days && diffInDays >= 0;
    } catch (error) {
        return false;
    }
}; 