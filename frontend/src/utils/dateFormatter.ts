/**
 * Utility function for consistent date formatting across server and client
 * @param dateStr - Date string in ISO format or DD/MM/YYYY format
 * @returns Formatted date string in DD/MM/YYYY format
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) {
    console.error('Empty date string provided to formatDate');
    return '';
  }

  try {
    // If already in DD/MM/YYYY format, return as is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return dateStr;
    }

    // For ISO date strings, parse without creating Date object
    const matches = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (matches) {
      // Ignore first element (full match) and destructure the capture groups
      const [, year, month, day] = matches;
      return `${day}/${month}/${year}`;
    }

    console.error('Invalid date format provided to formatDate:', dateStr);
    return '';
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};
