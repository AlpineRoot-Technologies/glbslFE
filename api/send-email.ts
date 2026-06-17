import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const MAX_SHORT = 100;
const MAX_LONG = 2000;
const MAX_BODY_BYTES = 32_000;

const ALLOWED_ORIGINS = [
  'https://guranslaghubitta.com.np',
  'https://www.guranslaghubitta.com.np',
  'https://glbsl.com.np',
  'https://www.glbsl.com.np',
];

const ALLOWED_FORM_TYPES = new Set(['contact', 'complaint', 'loan']);

// Escape HTML special characters to prevent HTML injection in email templates
const escapeHtml = (str: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#47;',
    '`': '&#96;',
  };
  return String(str).replace(/[&<>"'`/]/g, (char) => map[char]);
};

const safeField = (value: unknown): string => {
  if (value === undefined || value === null || value === '') return 'N/A';
  return escapeHtml(String(value)).replace(/\n/g, '<br>');
};

const safeSubjectPart = (value: unknown, maxLength = 80): string =>
  String(value ?? 'Unknown')
    .replace(/[\r\n]/g, ' ')
    .trim()
    .slice(0, maxLength) || 'Unknown';

const formatLoanAmount = (value: unknown): string => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 'N/A';
  return escapeHtml(num.toLocaleString('en-NP'));
};

const getResendApiKey = (): string | undefined => {
  // RESEND_API_KEY is the canonical server-side name.
  // VITE_RESEND_API_KEY is accepted only as a migration fallback for misnamed Vercel env vars.
  return process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
};

const getResendClient = (): Resend | null => {
  const apiKey = getResendApiKey();
  if (!apiKey) return null;
  return new Resend(apiKey);
};

const getFromAddress = (): string => {
  // Sandbox must win over RESEND_FROM_EMAIL — otherwise an unverified custom
  // from-address silently disables sandbox and Resend returns 502 in production.
  if (isSandboxMode()) {
    return 'Gurans Bank Website <onboarding@resend.dev>';
  }
  if (process.env.RESEND_FROM_EMAIL) return process.env.RESEND_FROM_EMAIL;
  return 'Gurans Bank Website <noreply@guranslaghubitta.com.np>';
};

const isSandboxMode = (): boolean => process.env.RESEND_SANDBOX_MODE === 'true';

const getSandboxRecipient = (): string | null => {
  const to = String(process.env.RESEND_SANDBOX_TO || '').trim();
  return isValidRecipientEmail(to) ? to : null;
};

const getRecipientEmail = (formType: string): string => {
  if (isSandboxMode()) {
    const sandboxTo = getSandboxRecipient();
    if (sandboxTo) return sandboxTo;
    // Do not fall through to info@glbsl.com.np — that requires a verified domain.
    return '';
  }
  switch (formType) {
    case 'complaint':
      return process.env.COMPLAINT_RECIPIENT_EMAIL || 'info@glbsl.com.np';
    case 'loan':
      return process.env.LOAN_RECIPIENT_EMAIL || 'info@glbsl.com.np';
    case 'contact':
    default:
      return process.env.CONTACT_RECIPIENT_EMAIL || 'info@glbsl.com.np';
  }
};

const isValidRecipientEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getRequestOrigin = (req: VercelRequest): string => {
  const raw = String(req.headers.origin || req.headers.referer || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return `${url.protocol}//${url.host}`;
  } catch {
    return raw.split('?')[0].replace(/\/$/, '');
  }
};

const isAllowedOrigin = (origin: string): boolean => {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`) return true;
  if (process.env.VERCEL_ENV === 'preview' && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
    return true;
  }
  return false;
};

const validateField = (value: unknown, maxLength: number): string | null => {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  if (!str || str.length > maxLength) return null;
  return str;
};

const validatePhoneField = (value: unknown): string | null => {
  const str = validateField(value, 20);
  if (!str) return null;
  if (!/^[0-9+\-().\s]{6,20}$/.test(str)) return null;
  return str;
};

const validateComplaintPayload = (data: Record<string, unknown>): string | null => {
  if (!validateField(data.fullName, MAX_SHORT)) return 'Invalid full name';
  if (!validatePhoneField(data.mobileNumber)) return 'Invalid mobile number';
  if (!validateField(data.branchOffice, MAX_SHORT)) return 'Invalid branch office';
  if (!validateField(data.complaint, MAX_LONG)) return 'Invalid complaint details';
  return null;
};

const validateContactPayload = (data: Record<string, unknown>): string | null => {
  if (!validateField(data.name, MAX_SHORT)) return 'Invalid name';
  const email = validateField(data.email, MAX_SHORT);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
  if (!validatePhoneField(data.phone)) return 'Invalid phone number';
  if (!validateField(data.subject, MAX_SHORT)) return 'Invalid subject';
  if (!validateField(data.message, MAX_LONG)) return 'Invalid message';
  return null;
};

const validateLoanPayload = (data: Record<string, unknown>): string | null => {
  if (!validateField(data.fullName, MAX_SHORT)) return 'Invalid full name';
  const email = validateField(data.email, MAX_SHORT);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
  if (!validatePhoneField(data.mobileNumber)) return 'Invalid mobile number';
  if (!validateField(data.branchOffice, MAX_SHORT)) return 'Invalid branch office';
  if (!validateField(data.province, MAX_SHORT)) return 'Invalid province';
  if (!validateField(data.district, MAX_SHORT)) return 'Invalid district';
  if (!validateField(data.localBody, MAX_SHORT)) return 'Invalid local body';
  if (!validateField(data.wardNumber, 10)) return 'Invalid ward number';
  const amount = Number(data.loanAmount);
  if (!Number.isFinite(amount) || amount <= 0) return 'Invalid loan amount';
  if (data.specialNote !== undefined && data.specialNote !== null) {
    const note = String(data.specialNote).trim();
    if (note.length > MAX_LONG) return 'Invalid special note';
  }
  return null;
};

const getContactEmailHtml = (data: Record<string, unknown>) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Lora', Georgia, serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; }
    .header { background: #1a3a1a; color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; }
    .content { padding: 30px 20px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 12px; border-bottom: 1px solid #eee; vertical-align: top; }
    .info-table td:first-child { font-weight: 600; color: #1a3a1a; width: 40%; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .accent { color: #DAA520; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Form Submission</h1>
    </div>
    <div class="content">
      <p style="margin-bottom: 20px; color: #555;">You have received a new contact form submission from the Gurans Bank website:</p>
      <table class="info-table">
        <tr><td>Name:</td><td>${safeField(data.name)}</td></tr>
        <tr><td>Email:</td><td>${safeField(data.email)}</td></tr>
        <tr><td>Phone:</td><td>${safeField(data.phone)}</td></tr>
        <tr><td>Subject:</td><td>${safeField(data.subject)}</td></tr>
        <tr><td>Message:</td><td>${safeField(data.message)}</td></tr>
        <tr><td>Submitted:</td><td>${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' })}</td></tr>
        <tr><td>Language:</td><td>${data.language === 'ne' ? 'Nepali (नेपाली)' : 'English'}</td></tr>
      </table>
    </div>
    <div class="footer">
      <p>This email was sent from <span class="accent">Gurans Laghubitta Bittiya Sanstha Ltd.</span> website</p>
      <p style="margin-top: 5px; font-size: 12px; color: #999;">www.glbsl.com.np</p>
    </div>
  </div>
</body>
</html>
`;

const getComplaintEmailHtml = (data: Record<string, unknown>) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Lora', Georgia, serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; }
    .header { background: #1a3a1a; color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; }
    .content { padding: 30px 20px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 12px; border-bottom: 1px solid #eee; vertical-align: top; }
    .info-table td:first-child { font-weight: 600; color: #1a3a1a; width: 40%; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .accent { color: #DAA520; font-weight: 600; }
    .urgent { background: #fff3cd; padding: 15px; border-left: 4px solid #DAA520; margin: 20px 0; border-radius: 4px; }
    .urgent strong { color: #856404; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ New Complaint Registration</h1>
    </div>
    <div class="content">
      <div class="urgent">
        <strong>⚠️ Action Required:</strong> A new complaint has been registered and requires attention.
      </div>
      <table class="info-table">
        <tr><td>Full Name:</td><td>${safeField(data.fullName)}</td></tr>
        <tr><td>Mobile Number:</td><td>${safeField(data.mobileNumber)}</td></tr>
        <tr><td>Branch Office:</td><td>${safeField(data.branchOffice)}</td></tr>
        <tr><td>Complaint Details:</td><td>${safeField(data.complaint)}</td></tr>
        <tr><td>Submitted:</td><td>${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' })}</td></tr>
        <tr><td>Language:</td><td>${data.language === 'ne' ? 'Nepali (नेपाली)' : 'English'}</td></tr>
      </table>
    </div>
    <div class="footer">
      <p>This complaint was submitted via <span class="accent">Gurans Laghubitta</span> website</p>
      <p style="margin-top: 5px; font-size: 12px; color: #999;">Please respond to the complainant promptly</p>
    </div>
  </div>
</body>
</html>
`;

const getLoanEmailHtml = (data: Record<string, unknown>) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Lora', Georgia, serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; }
    .header { background: #1a3a1a; color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; }
    .content { padding: 30px 20px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 12px; border-bottom: 1px solid #eee; vertical-align: top; }
    .info-table td:first-child { font-weight: 600; color: #1a3a1a; width: 40%; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .accent { color: #DAA520; font-weight: 600; }
    .highlight { background: #f0f8ff; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center; }
    .highlight strong { color: #1a3a1a; font-size: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 New Loan Application</h1>
    </div>
    <div class="content">
      <div class="highlight">
        <strong>Loan Amount Requested:</strong> <span class="accent">रु ${formatLoanAmount(data.loanAmount)}</span>
      </div>
      <table class="info-table">
        <tr><td>Full Name:</td><td>${safeField(data.fullName)}</td></tr>
        <tr><td>Email:</td><td>${safeField(data.email)}</td></tr>
        <tr><td>Mobile Number:</td><td>${safeField(data.mobileNumber)}</td></tr>
        <tr><td>Branch Office:</td><td>${safeField(data.branchOffice)}</td></tr>
        <tr><td>Province:</td><td>${safeField(data.province)}</td></tr>
        <tr><td>District:</td><td>${safeField(data.district)}</td></tr>
        <tr><td>Local Body:</td><td>${safeField(data.localBody)}</td></tr>
        <tr><td>Ward Number:</td><td>${safeField(data.wardNumber)}</td></tr>
        <tr><td>Loan Amount:</td><td>रु ${formatLoanAmount(data.loanAmount)}</td></tr>
        <tr><td>Special Notes:</td><td>${safeField(data.specialNote)}</td></tr>
        <tr><td>Submitted:</td><td>${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' })}</td></tr>
        <tr><td>Language:</td><td>${data.language === 'ne' ? 'Nepali (नेपाली)' : 'English'}</td></tr>
      </table>
    </div>
    <div class="footer">
      <p>This application was submitted via <span class="accent">Gurans Laghubitta</span> website</p>
      <p style="margin-top: 5px; font-size: 12px; color: #999;">Please contact the applicant to proceed with the loan process</p>
    </div>
  </div>
</body>
</html>
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = getRequestOrigin(req);
  const isDev = process.env.NODE_ENV !== 'production' && !process.env.VERCEL_URL;
  const originAllowed = isDev || isAllowedOrigin(origin);

  const corsOrigin = originAllowed ? (origin || ALLOWED_ORIGINS[0]) : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!originAllowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'Payload too large' });
  }

  try {
    const { formType, data } = req.body ?? {};

    if (typeof formType !== 'string' || !ALLOWED_FORM_TYPES.has(formType)) {
      return res.status(400).json({ error: 'Invalid formType' });
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ error: 'Missing or invalid data' });
    }

    const payload = data as Record<string, unknown>;

    const fieldsTooLong = Object.entries(payload).some(([, value]) => {
      return typeof value === 'string' && value.length > MAX_LONG;
    });
    if (fieldsTooLong) {
      return res.status(400).json({ error: 'One or more fields exceed maximum allowed length' });
    }

    let validationError: string | null = null;
    if (formType === 'complaint') validationError = validateComplaintPayload(payload);
    if (formType === 'contact') validationError = validateContactPayload(payload);
    if (formType === 'loan') validationError = validateLoanPayload(payload);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const resend = getResendClient();
    if (!resend) {
      console.error('Email service misconfigured: RESEND_API_KEY is not set');
      return res.status(503).json({ error: 'Email service is not configured' });
    }

    const recipientEmail = getRecipientEmail(formType);
    if (!isValidRecipientEmail(recipientEmail)) {
      if (isSandboxMode()) {
        console.error('RESEND_SANDBOX_MODE is enabled but RESEND_SANDBOX_TO is missing or invalid');
      } else {
        console.error(`Invalid recipient email configured for formType=${formType}`);
      }
      return res.status(503).json({ error: 'Email service is not configured' });
    }

    let subject: string;
    let htmlContent: string;

    switch (formType) {
      case 'contact':
        subject = `New Contact Form Submission - ${safeSubjectPart(payload.name)}`;
        htmlContent = getContactEmailHtml(payload);
        break;
      case 'complaint':
        subject = `New Complaint Registration - ${safeSubjectPart(payload.fullName)}`;
        htmlContent = getComplaintEmailHtml(payload);
        break;
      case 'loan':
        subject = `New Loan Application - ${safeSubjectPart(payload.fullName)} (रु ${formatLoanAmount(payload.loanAmount)})`;
        htmlContent = getLoanEmailHtml(payload);
        break;
      default:
        return res.status(400).json({ error: 'Invalid formType' });
    }

    const sendOptions: {
      from: string;
      to: string;
      subject: string;
      html: string;
      replyTo?: string;
    } = {
      from: getFromAddress(),
      to: recipientEmail,
      subject,
      html: htmlContent,
    };

    if (formType === 'contact' || formType === 'loan') {
      const replyTo = String(payload.email || '').trim();
      if (replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) {
        sendOptions.replyTo = replyTo;
      }
    }

    const emailResponse = await resend.emails.send(sendOptions);

    if (emailResponse.error) {
      const resendMessage = String(emailResponse.error.message || '');
      console.error('Resend API error:', emailResponse.error);
      if (resendMessage.includes('domain is not verified')) {
        console.error(
          'Resend domain not verified. Add DNS records at https://resend.com/domains ' +
          'or enable RESEND_SANDBOX_MODE=true with RESEND_SANDBOX_TO for interim testing.',
        );
      }
      return res.status(502).json({ error: 'Failed to send email' });
    }

    if (!emailResponse.data?.id) {
      console.error('Resend API returned no message id');
      return res.status(502).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
