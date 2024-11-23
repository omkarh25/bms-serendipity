/**
 * Utility functions for formatting data
 */

/**
 * Format amount as currency
 * @param amount - The amount to format
 * @returns Formatted amount string
 */
export const formatAmount = (amount: number | string | null | undefined): string => {
  // Check if amount is null or undefined
  if (amount == null) return '-';
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if it's a valid number
  if (typeof numAmount !== 'number' || isNaN(numAmount)) return '-';
  
  try {
    return `₹${numAmount.toFixed(2)}`;
  } catch (error) {
    console.error('Error formatting amount:', error);
    return '-';
  }
};

/**
 * Format date to locale string
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format boolean value to Yes/No
 * @param value - The boolean value to format
 * @returns Formatted string
 */
export const formatBoolean = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return value ? 'Yes' : 'No';
};
