import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.BREVO_LOGIN_EMAIL || !process.env.BREVO_SMTP_KEY) {
  console.warn('WARNING: Brevo credentials are not set. Email sending will fail.');
}

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_LOGIN_EMAIL || '',
    pass: process.env.BREVO_SMTP_KEY || '',
  },
});

export async function sendEmail(type, thought) {
  if (!process.env.BREVO_LOGIN_EMAIL || !process.env.BREVO_SMTP_KEY) {
    throw new Error('Brevo credentials not configured');
  }

  const subject = type === 'morning' ? '🌅 Fresh Start' : '🌙 Wind Down';
  const recipient = process.env.RECIPIENT_EMAIL || 'aryanbarde80@gmail.com';

  const mailOptions = {
    from: `"ThoughtDrop" <${process.env.SENDER_EMAIL || process.env.BREVO_LOGIN_EMAIL}>`,
    to: recipient,
    subject: subject,
    text: thought,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to', recipient);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error.message || error);
    throw error;
  }
}
