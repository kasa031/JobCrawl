// Validation utilities

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email.trim()) {
    return { valid: false, error: 'E-post er påkrevd' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Ugyldig e-post format' };
  }
  
  return { valid: true };
};

export const validatePassword = (password: string, minLength: number = 6): { valid: boolean; error?: string } => {
  if (!password) {
    return { valid: false, error: 'Passord er påkrevd' };
  }
  
  if (password.length < minLength) {
    return { valid: false, error: `Passord må være minst ${minLength} tegn` };
  }
  
  return { valid: true };
};

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone.trim()) {
    return { valid: true }; // Phone is optional
  }
  
  // Norwegian phone formats: +47 123 45 678, 123 45 678, 12345678, etc.
  const phoneRegex = /^(\+47\s?)?[2-9]\d{7}$|^(\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/;
  const cleaned = phone.replace(/\s/g, '');
  
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: 'Ugyldig telefonnummer format' };
  }
  
  return { valid: true };
};

export const validateRequired = (value: string, fieldName: string): { valid: boolean; error?: string } => {
  if (!value || !value.trim()) {
    return { valid: false, error: `${fieldName} er påkrevd` };
  }
  return { valid: true };
};

export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name.trim()) {
    return { valid: false, error: 'Navn er påkrevd' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: 'Navn må være minst 2 tegn' };
  }
  
  if (name.trim().length > 100) {
    return { valid: false, error: 'Navn kan ikke være lengre enn 100 tegn' };
  }
  
  return { valid: true };
};

export const validateExperience = (experience: number): { valid: boolean; error?: string } => {
  if (experience < 0) {
    return { valid: false, error: 'Erfaring kan ikke være negativ' };
  }
  
  if (experience > 50) {
    return { valid: false, error: 'Erfaring kan ikke være mer enn 50 år' };
  }
  
  return { valid: true };
};

