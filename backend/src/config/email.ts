import nodemailer from 'nodemailer';
import { logError, logInfo } from './logger';

// Email configuration for sending verification emails
// Supports Mailhog (localhost:1025) or real SMTP servers
// Now with dynamic provider routing (Gmail/iCloud) + fallback

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth?: { user?: string; pass?: string };
  tls?: { rejectUnauthorized: boolean };
  from?: string;
};

const parseIntSafe = (value: string | undefined, fallback: number): number => {
  const n = parseInt(value || '');
  return Number.isFinite(n) ? n : fallback;
};

// Generic/default SMTP from legacy env (SMTP_*) or MailHog
const defaultIsMailHog = (process.env.SMTP_HOST || 'localhost') === 'localhost';
const defaultConfig: SmtpConfig = {
  host: process.env.SMTP_HOST || 'localhost',
  port: parseIntSafe(process.env.SMTP_PORT, defaultIsMailHog ? 1025 : 587),
  secure: false,
  auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  } : undefined,
  tls: defaultIsMailHog ? { rejectUnauthorized: false } : undefined,
  from: process.env.SMTP_USER || 'noreply@jobcrawl.local',
};

// Optional dedicated configs for Gmail and iCloud if provided
const gmailConfig: SmtpConfig | undefined = (process.env.GMAIL_SMTP_HOST || process.env.SMTP_HOST)?.includes('gmail')
  ? {
      host: process.env.GMAIL_SMTP_HOST || 'smtp.gmail.com',
      port: parseIntSafe(process.env.GMAIL_SMTP_PORT, 587),
      secure: false, // Port 587 uses STARTTLS, not direct SSL
      auth: {
        user: process.env.GMAIL_SMTP_USER || process.env.SMTP_USER,
        pass: process.env.GMAIL_SMTP_PASSWORD || process.env.SMTP_PASSWORD,
      },
      tls: { rejectUnauthorized: true }, // ✅ Always validate TLS certificates for production SMTP
      from: process.env.GMAIL_SMTP_USER || process.env.SMTP_USER || 'noreply@jobcrawl.local',
    }
  : undefined;

const icloudConfig: SmtpConfig | undefined = (process.env.ICLOUD_SMTP_HOST || '')
  ? {
      host: process.env.ICLOUD_SMTP_HOST || 'smtp.mail.me.com',
      port: parseIntSafe(process.env.ICLOUD_SMTP_PORT, 587),
      secure: false, // Port 587 uses STARTTLS, not direct SSL
      auth: {
        user: process.env.ICLOUD_SMTP_USER,
        pass: process.env.ICLOUD_SMTP_PASSWORD,
      },
      tls: { rejectUnauthorized: true }, // ✅ Always validate TLS certificates for production SMTP
      from: process.env.ICLOUD_SMTP_USER || 'noreply@jobcrawl.local',
    }
  : undefined;

const createTransporter = (cfg: SmtpConfig) => nodemailer.createTransport({
  host: cfg.host,
  port: cfg.port,
  secure: cfg.secure,
  auth: cfg.auth,
  tls: cfg.tls,
});

const selectProviderForEmail = (recipient: string): { primary: SmtpConfig; secondary: SmtpConfig } => {
  const domain = recipient.split('@')[1]?.toLowerCase() || '';

  const gmailDomains = ['gmail.com', 'googlemail.com'];
  const icloudDomains = ['icloud.com', 'me.com', 'mac.com'];

  const hasGmail = !!gmailConfig;
  const hasIcloud = !!icloudConfig;

  // Prefer matching domain provider if configured
  if (icloudDomains.includes(domain) && hasIcloud) {
    return { primary: icloudConfig!, secondary: gmailConfig || defaultConfig };
  }
  if (gmailDomains.includes(domain) && hasGmail) {
    return { primary: gmailConfig!, secondary: icloudConfig || defaultConfig };
  }

  // Default order: Gmail → iCloud → default
  if (hasGmail) {
    return { primary: gmailConfig!, secondary: icloudConfig || defaultConfig };
  }
  if (hasIcloud) {
    return { primary: icloudConfig!, secondary: gmailConfig || defaultConfig };
  }
  return { primary: defaultConfig, secondary: defaultConfig };
};

export const sendVerificationEmail = async (
  email: string,
  token: string,
  fullName: string
): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  // Log that email was sent (but NOT the token for security)
  if (process.env.NODE_ENV === 'development') {
    logInfo('Verification email would be sent', {
      email,
      mailhogUrl: 'http://127.0.0.1:8025',
      note: 'E-post sendes til MailHog - sjekk MailHog UI for verifiseringslenken',
    });
  }

  const { primary, secondary } = selectProviderForEmail(email);

  const mailOptions = {
    from: primary.from || 'noreply@jobcrawl.local',
    to: email,
    subject: 'Verify your JobCrawl account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF5F0; padding: 20px;">
        <div style="background-color: #F5ECE2; padding: 20px; border-radius: 8px; border: 1px solid #E8D5C1;">
          <h1 style="color: #2A2018; margin-top: 0;">Welcome to JobCrawl!</h1>
          <p style="color: #3D2F1F;">Hi ${fullName},</p>
          <p style="color: #3D2F1F;">Thank you for signing up for JobCrawl. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #C29B73; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify Email</a>
          </div>
          <p style="color: #6B5439; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #8B6B47; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #6B5439; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
        </div>
      </div>
    `,
    text: `
Hi ${fullName},

Thank you for signing up for JobCrawl! Please verify your email address by clicking the link below:

${verificationUrl}

If you didn't create this account, you can safely ignore this email.

Thanks,
The JobCrawl Team
    `,
  };

  try {
    logInfo('Attempting to send verification email', {
      email,
      smtpHost: primary.host,
      smtpPort: primary.port,
    });
    const info = await createTransporter(primary).sendMail(mailOptions);
    logInfo('Verification email sent', {
      email,
      messageId: info.messageId,
      smtpHost: primary.host,
      smtpPort: primary.port,
      response: info.response,
    });
  } catch (error: any) {
    logError('Primary SMTP failed', error as Error, { email, smtpHost: primary.host });
    // Try secondary as fallback
    try {
      const info2 = await createTransporter(secondary).sendMail(mailOptions);
      logInfo('Verification email sent (fallback)', {
        email,
        messageId: info2.messageId,
        smtpHost: secondary.host,
        smtpPort: secondary.port,
      });
    } catch (error2: any) {
      logError('Failed to send verification email (primary and fallback)', error2 as Error, {
        email,
        primaryHost: primary.host,
        secondaryHost: secondary.host,
      });
      // Don't throw - allow development without email setup
    }
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  fullName: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/JobCrawl/reset-password?token=${token}`;
  
  if (process.env.NODE_ENV === 'development') {
    logInfo('Password reset email would be sent', {
      email,
      resetUrl,
      note: 'E-post sendes til MailHog i development mode',
    });
  }

  const { primary, secondary } = selectProviderForEmail(email);

  const mailOptions = {
    from: primary.from || 'noreply@jobcrawl.local',
    to: email,
    subject: 'Tilbakestill passordet ditt - JobCrawl',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF5F0; padding: 20px;">
        <div style="background-color: #F5ECE2; padding: 20px; border-radius: 8px; border: 1px solid #E8D5C1;">
          <h1 style="color: #2A2018; margin-top: 0;">Tilbakestill passordet ditt</h1>
          <p style="color: #3D2F1F;">Hei ${fullName},</p>
          <p style="color: #3D2F1F;">Vi har mottatt en forespørsel om å tilbakestille passordet ditt. Klikk på knappen under for å velge et nytt passord:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #C29B73; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Tilbakestill passord</a>
          </div>
          <p style="color: #6B5439; font-size: 14px;">Hvis knappen ikke fungerer, kopier og lim inn denne lenken i nettleseren din:</p>
          <p style="color: #8B6B47; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <p style="color: #6B5439; font-size: 12px; margin-top: 30px;">Denne lenken utløper om 1 time.</p>
          <p style="color: #6B5439; font-size: 12px;">Hvis du ikke ba om å tilbakestille passordet, kan du trygt ignorere denne e-posten.</p>
        </div>
      </div>
    `,
    text: `
Hei ${fullName},

Vi har mottatt en forespørsel om å tilbakestille passordet ditt for JobCrawl-kontoen din.

Klikk på lenken under for å velge et nytt passord:
${resetUrl}

Denne lenken utløper om 1 time.

Hvis du ikke ba om å tilbakestille passordet, kan du trygt ignorere denne e-posten.

Med vennlig hilsen,
JobCrawl-teamet
    `,
  };

  try {
    const info = await createTransporter(primary).sendMail(mailOptions);
    logInfo('Password reset email sent', {
      email,
      messageId: info.messageId,
      smtpHost: primary.host,
    });
  } catch (error: any) {
    logError('Primary SMTP failed for password reset', error as Error, { email, smtpHost: primary.host });
    try {
      const info2 = await createTransporter(secondary).sendMail(mailOptions);
      logInfo('Password reset email sent (fallback)', {
        email,
        messageId: info2.messageId,
        smtpHost: secondary.host,
      });
    } catch (error2: any) {
      logError('Failed to send password reset email (primary and fallback)', error2 as Error, {
        email,
        primaryHost: primary.host,
        secondaryHost: secondary.host,
      });
      // Don't throw - allow development without email setup
    }
  }
};

