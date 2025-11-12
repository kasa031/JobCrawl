import { Response } from 'express';
import { Request } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database';
import { sendVerificationEmail } from '../config/email';
import { logError, logInfo } from '../config/logger';
import { AuthRequest } from '../middleware/auth';
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

// JWT token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY_DAYS = 30; // Long-lived refresh token

// Helper function to generate refresh token
const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

// Helper function to create access token
const createAccessToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET!,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

export const register = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email, password, fullName } = req.body;

    // Input validation using utility functions
    const validation = validateRequiredFields(req.body, ['email', 'password', 'fullName']);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Alle felt er påkrevd',
        missingFields: validation.missingFields,
      });
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeString(email, 255).toLowerCase();
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Ugyldig e-postformat' });
    }

    // Sanitize and validate full name
    const sanitizedFullName = sanitizeString(fullName, 100);
    if (!validateStringLength(sanitizedFullName, 2, 100)) {
      return res.status(400).json({ error: 'Fullt navn må være mellom 2 og 100 tegn' });
    }

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Passord må være minst 8 tegn langt' });
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
        error: 'Passord må inneholde minst én stor bokstav, én liten bokstav og ett tall' 
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'En bruker med denne e-postadressen finnes allerede' });
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
    res.status(500).json({ error: 'Kunne ikke registrere bruker' });
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
        error: 'E-post og passord er påkrevd',
        missingFields: validation.missingFields,
      });
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeString(email, 255).toLowerCase();
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Ugyldig e-postformat' });
    }

    // Basic password length check
    if (password.length < 1 || password.length > 128) {
      return res.status(400).json({ error: 'Ugyldig passordformat' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      // Use generic message to prevent user enumeration
      return res.status(401).json({ error: 'Ugyldig e-post eller passord' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ 
        error: 'Vennligst verifiser e-posten din før innlogging. Sjekk innboksen din for verifiseringslenke.',
        requiresVerification: true 
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      // Use generic message to prevent user enumeration
      return res.status(401).json({ error: 'Ugyldig e-post eller passord' });
    }

    // Generate access token (short-lived)
    const accessToken = createAccessToken(user.id, user.email);

    // Generate and save refresh token (long-lived)
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    // Save refresh token to database
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    // Clean up expired refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() },
      },
    });

    logInfo('User logged in', { userId: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      token: accessToken, // Access token
      refreshToken, // Refresh token
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
    res.status(500).json({ error: 'Kunne ikke logge inn' });
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
      return res.status(400).json({ error: 'Ugyldig e-postformat' });
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

export const refreshToken = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Find refresh token in database
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshTokenRecord) {
      return res.status(401).json({ error: 'Ugyldig refresh token' });
    }

    // Check if token is expired
    if (refreshTokenRecord.expiresAt < new Date()) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { id: refreshTokenRecord.id },
      });
      return res.status(401).json({ error: 'Refresh token har utløpt' });
    }

    // Check if user still exists and is verified
    if (!refreshTokenRecord.user.emailVerified) {
      return res.status(403).json({ error: 'Bruker er ikke verifisert' });
    }

    // Generate new access token
    const accessToken = createAccessToken(
      refreshTokenRecord.user.id,
      refreshTokenRecord.user.email
    );

    logInfo('Token refreshed', { userId: refreshTokenRecord.user.id });

    res.json({
      message: 'Token refreshed successfully',
      token: accessToken,
      // Optionally rotate refresh token for better security
      // For now, we keep the same refresh token
    });
  } catch (error) {
    logError('Refresh token error', error as Error);
    res.status(500).json({ error: 'Kunne ikke oppdatere token' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    logError('Get me error', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-post er påkrevd' });
    }

    const sanitizedEmail = sanitizeString(email, 255).toLowerCase();
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Ugyldig e-postformat' });
    }

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      // Still return success to prevent user enumeration
      return res.json({ 
        message: 'Hvis en bruker med denne e-postadressen finnes, vil du motta en e-post med instruksjoner for å tilbakestille passordet.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Store reset token in user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetTokenExpiry,
      },
    });

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/JobCrawl/reset-password?token=${resetToken}`;
    
    // Import and use email sending function
    const { sendPasswordResetEmail } = await import('../config/email');
    await sendPasswordResetEmail(sanitizedEmail, resetToken, user.fullName);

    logInfo('Password reset requested', { email: sanitizedEmail, userId: user.id });

    res.json({ 
      message: 'Hvis en bruker med denne e-postadressen finnes, vil du motta en e-post med instruksjoner for å tilbakestille passordet.' 
    });
  } catch (error) {
    logError('Request password reset error', error as Error, { email: req.body.email });
    res.status(500).json({ error: 'Kunne ikke behandle forespørsel om passordtilbakestilling' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token og nytt passord er påkrevd' });
    }

    // Validate password
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'Passord må være minst 8 tegn langt' });
    }

    if (newPassword.length > 128) {
      return res.status(400).json({ error: 'Passord må være mindre enn 128 tegn' });
    }

    // Check for password requirements
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return res.status(400).json({ 
        error: 'Passord må inneholde minst én stor bokstav, én liten bokstav og ett tall' 
      });
    }

    // Find user with this reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Ugyldig eller utløpt tilbakestillingslenke' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    logInfo('Password reset successful', { userId: user.id, email: user.email });

    res.json({ 
      message: 'Passordet ditt har blitt tilbakestilt. Du kan nå logge inn med ditt nye passord.' 
    });
  } catch (error) {
    logError('Reset password error', error as Error);
    res.status(500).json({ error: 'Kunne ikke tilbakestille passord' });
  }
};
