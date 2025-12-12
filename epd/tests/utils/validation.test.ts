import { isValidId, validateIdParam } from '../../backend/src/utils/validation';

describe('Validation Utils', () => {
  describe('isValidId', () => {
    it('should return true for valid positive integers', () => {
      expect(isValidId('1')).toBe(true);
      expect(isValidId('42')).toBe(true);
      expect(isValidId('1000')).toBe(true);
    });

    it('should return false for zero', () => {
      expect(isValidId('0')).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(isValidId('-1')).toBe(false);
      expect(isValidId('-42')).toBe(false);
    });

    it('should return false for non-numeric strings', () => {
      expect(isValidId('abc')).toBe(false);
      expect(isValidId('12abc')).toBe(false);
      expect(isValidId('')).toBe(false);
    });

    it('should return false for decimal numbers', () => {
      expect(isValidId('1.5')).toBe(false);
      expect(isValidId('3.14')).toBe(false);
    });
  });

  describe('validateIdParam', () => {
    it('should return null for valid positive integers', () => {
      expect(validateIdParam('1', 'patient')).toBeNull();
      expect(validateIdParam('42', 'allergy')).toBeNull();
    });

    it('should return error for non-numeric values', () => {
      const result = validateIdParam('abc', 'patient');
      expect(result).toEqual({
        status: 400,
        error: 'Invalid patient ID'
      });
    });

    it('should return error for zero', () => {
      const result = validateIdParam('0', 'patient');
      expect(result).toEqual({
        status: 400,
        error: 'patient ID must be a positive integer'
      });
    });

    it('should return error for negative numbers', () => {
      const result = validateIdParam('-1', 'allergy');
      expect(result).toEqual({
        status: 400,
        error: 'allergy ID must be a positive integer'
      });
    });

    it('should use default resource name when not provided', () => {
      const result = validateIdParam('abc');
      expect(result).toEqual({
        status: 400,
        error: 'Invalid resource ID'
      });
    });
  });
});
