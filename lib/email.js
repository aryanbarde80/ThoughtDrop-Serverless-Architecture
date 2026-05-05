import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_LOGIN_EMAIL,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

export async function sendEmail(type, thought) {
  const subject = type === 'morning' ? '🌅 Fresh Start' : '🌙 Wind Down';
  const recipient = 'aryanbarde80@gmail.com'; // As specified in the prompt

  const mailOptions = {
    from: `"ThoughtDrop" <${process.env.BREVO_LOGIN_EMAIL}>`,
    to: recipient,
    subject: subject,
    text: thought,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}
