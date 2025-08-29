import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.Mail_Trap_User,     // From your screenshot
    pass: process.env.Mail_Trap_Pass, // Replace with actual one (from dashboard, not stars)
  },
});

export default transporter;
