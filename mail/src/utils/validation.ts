/**
 * Validation utility functions for input validation
 */

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if email format is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns true if password meets minimum requirements, false otherwise
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}
