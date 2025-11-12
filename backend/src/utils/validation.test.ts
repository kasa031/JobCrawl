import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateStringLength,
  validateUUID,
  validatePhoneNumber,
  validateKeywords,
  validateLocation,
} from './validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate passwords with minimum requirements', () => {
      expect(validatePassword('Password123')).toBe(true);
      expect(validatePassword('SecurePass1')).toBe(true);
    });

    it('should reject passwords that are too short', () => {
      expect(validatePassword('Short1')).toBe(false);
      expect(validatePassword('Pass1')).toBe(false);
    });

    it('should reject passwords without uppercase', () => {
      expect(validatePassword('password123')).toBe(false);
    });

    it('should reject passwords without lowercase', () => {
      expect(validatePassword('PASSWORD123')).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      expect(validatePassword('Password')).toBe(false);
    });
  });

  describe('validateStringLength', () => {
    it('should validate strings within range', () => {
      expect(validateStringLength('test', 1, 10)).toBe(true);
      expect(validateStringLength('a', 1, 10)).toBe(true);
      expect(validateStringLength('1234567890', 1, 10)).toBe(true);
    });

    it('should reject strings that are too short', () => {
      expect(validateStringLength('', 1, 10)).toBe(false);
    });

    it('should reject strings that are too long', () => {
      expect(validateStringLength('12345678901', 1, 10)).toBe(false);
    });
  });

  describe('validateUUID', () => {
    it('should validate correct UUID v4', () => {
      expect(validateUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(validateUUID('not-a-uuid')).toBe(false);
      expect(validateUUID('123e4567-e89b-12d3-a456')).toBe(false);
      expect(validateUUID('')).toBe(false);
      expect(validateUUID('123e4567-e89b-12d3-a456-42661417400')).toBe(false); // Too short
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate Norwegian phone numbers', () => {
      expect(validatePhoneNumber('+47 123 45 678')).toBe(true);
      expect(validatePhoneNumber('12345678')).toBe(true);
      expect(validatePhoneNumber('+47 12 34 56 78')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('abc')).toBe(false);
      expect(validatePhoneNumber('123')).toBe(false); // Too short
    });
  });

  describe('validateKeywords', () => {
    it('should validate and sanitize keywords', () => {
      expect(validateKeywords('developer')).toBe('developer');
      expect(validateKeywords('  frontend developer  ')).toBe('frontend developer');
    });

    it('should return undefined for invalid input', () => {
      expect(validateKeywords('')).toBeUndefined();
      expect(validateKeywords(null as any)).toBeUndefined();
      expect(validateKeywords(undefined)).toBeUndefined();
    });

    it('should truncate very long keywords', () => {
      const longKeyword = 'a'.repeat(300);
      const result = validateKeywords(longKeyword);
      expect(result?.length).toBeLessThanOrEqual(200);
    });
  });

  describe('validateLocation', () => {
    it('should validate and sanitize location', () => {
      expect(validateLocation('Oslo')).toBe('Oslo');
      expect(validateLocation('  Bergen  ')).toBe('Bergen');
    });

    it('should return undefined for invalid input', () => {
      expect(validateLocation('')).toBeUndefined();
      expect(validateLocation(null as any)).toBeUndefined();
      expect(validateLocation(undefined)).toBeUndefined();
    });

    it('should truncate very long locations', () => {
      const longLocation = 'a'.repeat(150);
      const result = validateLocation(longLocation);
      expect(result?.length).toBeLessThanOrEqual(100);
    });
  });
});

