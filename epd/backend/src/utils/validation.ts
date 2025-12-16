/**
 * Validates that a string represents a valid positive integer ID
 * @param value - The string value to validate
 * @returns true if the value is a valid positive integer, false otherwise
 */
export const isValidId = (value: string): boolean => {
  // First check if the string is a valid integer format (no decimals, no extra chars)
  if (!/^\d+$/.test(value)) {
    return false;
  }
  
  const id = parseInt(value, 10);
  return !isNaN(id) && id > 0;
};

/**
 * Validates an ID parameter and returns appropriate error response data if invalid
 * @param value - The string value to validate
 * @param resourceName - Name of the resource for error messages (e.g., 'patient', 'allergy')
 * @returns null if valid, or error response object if invalid
 */
export const validateIdParam = (value: string, resourceName: string = 'resource') => {
  const id = parseInt(value, 10);
  
  if (isNaN(id)) {
    return { status: 400, error: `Invalid ${resourceName} ID` };
  }
  
  if (id <= 0) {
    return { status: 400, error: `${resourceName} ID must be a positive integer` };
  }
  
  return null;
};
