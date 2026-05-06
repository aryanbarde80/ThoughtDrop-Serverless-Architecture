import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export async function sendEmail(type, thought) {
  const loginEmail = process.env.BREVO_LOGIN_EMAIL;
  const smtpKey = process.env.BREVO_SMTP_KEY;

  if (!loginEmail || !smtpKey) {
    throw new Error('Brevo credentials not configured. Set BREVO_LOGIN_EMAIL and BREVO_SMTP_KEY.');
  }

  // Create transporter at request time so env vars are always fresh
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: loginEmail,
      pass: smtpKey,
    },
  });

  const subject = type === 'morning' ? '🌅 Fresh Start — ThoughtDrop' : '🌙 Wind Down — ThoughtDrop';
  const recipient = process.env.RECIPIENT_EMAIL || 'aryanbarde80@gmail.com';
  const senderEmail = process.env.SENDER_EMAIL || loginEmail;

  const mailOptions = {
    from: `"ThoughtDrop" <${senderEmail}>`,
    to: recipient,
    subject: subject,
    text: thought,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: white;">ThoughtDrop</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">${type === 'morning' ? '🌅 Morning Thought' : '🌙 Evening Thought'}</p>
        </div>
        <div style="padding: 32px 24px;">
          <p style="font-size: 20px; line-height: 1.7; color: #e2e8f0; white-space: pre-wrap; margin: 0;">${thought}</p>
        </div>
        <div style="padding: 16px 24px 24px; text-align: center; color: #475569; font-size: 12px;">
          Delivered with ❤️ by ThoughtDrop
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to', recipient, '| MessageId:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message || error);
    throw error;
  }
}
