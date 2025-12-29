import { describe, expect, it } from 'vitest';

import {
    forgotPasswordSchema,
    loginSchema,
    profileUpdateSchema,
    registerSchema,
    resetPasswordSchema,
} from './authSchemas';

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true,
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should require email', () => {
    const invalidData = {
      email: '',
      password: 'password123',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email is required');
    }
  });

  it('should require password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: '',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password is required');
    }
  });

  it('should reject email over 100 characters', () => {
    const invalidData = {
      email: 'a'.repeat(92) + '@test.com',
      password: 'password123',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should default rememberMe to false', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rememberMe).toBe(false);
    }
  });
});

describe('registerSchema', () => {
  const validData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
    acceptTerms: true,
  };

  it('should validate correct registration data', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should require first name', () => {
    const result = registerSchema.safeParse({ ...validData, firstName: '' });
    expect(result.success).toBe(false);
  });

  it('should require last name', () => {
    const result = registerSchema.safeParse({ ...validData, lastName: '' });
    expect(result.success).toBe(false);
  });

  it('should require valid email', () => {
    const result = registerSchema.safeParse({ ...validData, email: 'invalid-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((issue) => issue.path[0] === 'email');
      expect(emailError?.message).toBe('Please enter a valid email address');
    }
  });

  it('should require password with minimum 8 characters', () => {
    const result = registerSchema.safeParse({ ...validData, password: 'Short1', confirmPassword: 'Short1' });
    expect(result.success).toBe(false);
  });

  it('should require password with uppercase letter', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'password1',
      confirmPassword: 'password1',
    });
    expect(result.success).toBe(false);
  });

  it('should require password with lowercase letter', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'PASSWORD1',
      confirmPassword: 'PASSWORD1',
    });
    expect(result.success).toBe(false);
  });

  it('should require password with number', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'PasswordABC',
      confirmPassword: 'PasswordABC',
    });
    expect(result.success).toBe(false);
  });

  it('should require passwords to match', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Password1',
      confirmPassword: 'Password2',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find((issue) => issue.path[0] === 'confirmPassword');
      expect(confirmError?.message).toBe('Passwords do not match');
    }
  });

  it('should require terms acceptance', () => {
    const result = registerSchema.safeParse({ ...validData, acceptTerms: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      const termsError = result.error.issues.find((issue) => issue.path[0] === 'acceptTerms');
      expect(termsError?.message).toBe('You must accept the terms and conditions');
    }
  });

  it('should only allow letters in names', () => {
    const result = registerSchema.safeParse({ ...validData, firstName: 'John123' });
    expect(result.success).toBe(false);
  });

  it('should allow hyphens and apostrophes in names', () => {
    const result = registerSchema.safeParse({
      ...validData,
      firstName: "Mary-Jane",
      lastName: "O'Connor",
    });
    expect(result.success).toBe(true);
  });
});

describe('forgotPasswordSchema', () => {
  it('should validate correct email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('should require email', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email is required');
    }
  });

  it('should reject invalid email format', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('should validate matching passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'NewPassword1',
      confirmPassword: 'NewPassword1',
    });
    expect(result.success).toBe(true);
  });

  it('should require passwords to match', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'NewPassword1',
      confirmPassword: 'DifferentPassword1',
    });
    expect(result.success).toBe(false);
  });

  it('should enforce password strength requirements', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'weak',
      confirmPassword: 'weak',
    });
    expect(result.success).toBe(false);
  });
});

describe('profileUpdateSchema', () => {
  const validData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  it('should validate correct profile data', () => {
    const result = profileUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should allow optional phone', () => {
    const result = profileUpdateSchema.safeParse({ ...validData, phone: '+1-555-123-4567' });
    expect(result.success).toBe(true);
  });

  it('should validate phone format if provided', () => {
    const result = profileUpdateSchema.safeParse({ ...validData, phone: 'not a phone' });
    expect(result.success).toBe(false);
  });

  it('should allow empty phone', () => {
    const result = profileUpdateSchema.safeParse({ ...validData, phone: '' });
    expect(result.success).toBe(true);
  });

  it('should require valid email', () => {
    const result = profileUpdateSchema.safeParse({ ...validData, email: 'invalid' });
    expect(result.success).toBe(false);
  });
});
