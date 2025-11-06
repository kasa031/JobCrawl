import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database';
import { sendVerificationEmail } from '../config/email';
import { logError, logInfo } from '../config/logger';
import {
  validateEmail,
  validatePassword,
  validateStringLength,
  sanitizeString,
  validateRequiredFields,
} from '../utils/validation';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET must be set in environment variables. Server cannot start without it.');
}

export const register = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email, password, fullName } = req.body;

    // Input validation using utility functions
    const validation = validateRequiredFields(req.body, ['email', 'password', 'fullName']);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'All fields are required',
        missingFields: validation.missingFields,
      });
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeString(email, 255).toLowerCase();
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Sanitize and validate full name
    const sanitizedFullName = sanitizeString(fullName, 100);
    if (!validateStringLength(sanitizedFullName, 2, 100)) {
      return res.status(400).json({ error: 'Full name must be between 2 and 100 characters' });
    }

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    if (password.length > 128) {
      return res.status(400).json({ error: 'Password must be less than 128 characters' });
    }

    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return res.status(400).json({ 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user (needs email verification)
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        passwordHash,
        fullName: sanitizedFullName,
        emailVerified: false,
        emailVerificationToken: verificationToken,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email
    await sendVerificationEmail(sanitizedEmail, verificationToken, sanitizedFullName);
    
    logInfo('User registered', { userId: user.id, email: user.email });

    logInfo('User registration successful', { userId: user.id, email: user.email });
    
    res.status(201).json({
      message: 'User created. Please check your email to verify your account.',
      user,
      requiresVerification: true,
    });
  } catch (error) {
    logError('Registration error', error as Error, { email: req.body.email });
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const token = req.query.token as string | undefined;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token as string,
        emailVerified: false,
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Verify user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    logInfo('Email verified successfully', { userId: user.id, email: user.email });

    res.json({
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    const token = req.query.token as string | undefined;
    logError('Email verification error', error as Error, { token: token || 'missing' });
    res.status(500).json({ error: 'Failed to verify email' });
  }
};

export const login = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    // Input validation using utility functions
    const validation = validateRequiredFields(req.body, ['email', 'password']);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        missingFields: validation.missingFields,
      });
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeString(email, 255).toLowerCase();
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Basic password length check
    if (password.length < 1 || password.length > 128) {
      return res.status(400).json({ error: 'Invalid password format' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ 
        error: 'Please verify your email before logging in',
        requiresVerification: true 
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    logInfo('User logged in', { userId: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logError('Login error', error as Error, { email: req.body.email });
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const resendVerification = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If an account exists with this email, a verification link has been sent.' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: verificationToken },
    });

    await sendVerificationEmail(email, verificationToken, user.fullName);

    logInfo('Verification email resent', { email });
    res.json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    logError('Resend verification error', error as Error, { email: req.body.email });
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // Extract token from header
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerified: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    logError('Get me error - invalid token', error as Error);
    res.status(401).json({ error: 'Invalid token' });
  }
};
