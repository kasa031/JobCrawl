/**
 * Validation utilities for request data
 */

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: at least 8 characters, uppercase, lowercase, and number
 */
export function validatePassword(password: string): boolean {
  if (!password || password.length < 8) {
    return false;
  }
  
  // Check for uppercase letter
  if (!/[A-ZÆØÅ]/.test(password)) {
    return false;
  }
  
  // Check for lowercase letter
  if (!/[a-zæøå]/.test(password)) {
    return false;
  }
  
  // Check for number
  if (!/[0-9]/.test(password)) {
    return false;
  }
  
  return true;
}

/**
 * Validate phone number (Norwegian format)
 * Accepts: digits, spaces, +, -, parentheses
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  return phoneRegex.test(phone.trim()) && phone.trim().length >= 8;
}

/**
 * Validate UUID format (supports UUID v4)
 */
export function validateUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  // UUID v4 format: 8-4-4-4-12 hexadecimal characters
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize string input (remove dangerous characters, trim)
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, maxLength);
}

/**
 * Validate and sanitize search keywords
 */
export function validateKeywords(keywords: string | undefined): string | null {
  if (!keywords) return null;
  
  const sanitized = sanitizeString(keywords, 200);
  if (sanitized.length < 1) return null;
  
  return sanitized;
}

/**
 * Validate and sanitize location
 */
export function validateLocation(location: string | undefined): string | null {
  if (!location) return null;
  
  const sanitized = sanitizeString(location, 100);
  if (sanitized.length < 1) return null;
  
  return sanitized;
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page?: string | number, limit?: string | number): { page: number; limit: number } {
  const pageNum = typeof page === 'string' ? parseInt(page, 10) : (page || 1);
  const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : (limit || 20);
  
  return {
    page: Math.max(1, Math.min(pageNum, 1000)), // Between 1 and 1000
    limit: Math.max(1, Math.min(limitNum, 100)), // Between 1 and 100
  };
}

/**
 * Validate application status
 */
export function validateApplicationStatus(status: string): boolean {
  const validStatuses = [
    'DRAFT',
    'PENDING',
    'SENT',
    'VIEWED',
    'REJECTED',
    'ACCEPTED',
    'INTERVIEW',
    'OFFER',
  ];
  return validStatuses.includes(status.toUpperCase());
}

/**
 * Validate date string (ISO format)
 */
export function validateDate(dateString: string | undefined): Date | null {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date;
}

/**
 * Validate file extension for CV uploads
 */
export function validateCVFileExtension(filename: string): boolean {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedExtensions.includes(extension);
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(size: number, maxSize: number = 5 * 1024 * 1024): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Validate required fields in object
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  minLength: number = 0,
  maxLength: number = Infinity
): boolean {
  return value.length >= minLength && value.length <= maxLength;
}

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  min: number = -Infinity,
  max: number = Infinity
): boolean {
  return value >= min && value <= max;
}

