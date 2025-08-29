import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

const TOKEN = process.env.MAILTRAP_TOKEN || "830c0fb44d06dc252e15bd3c2dbe6384";
const TEST_INBOX_ID = process.env.MAILTRAP_INBOX || 3458737;

const transport = nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
    testInboxId: Number(TEST_INBOX_ID), // ✅ ensure it's a number
  })
);

const sendMail = async ({ to, subject, html }) => {
  const sender = {
    address: "hello@example.com",
    name: "Hotel Management",
  };

  try {
    await transport.sendMail({
      from: sender,
      to, // ✅ use the dynamic `to` parameter
      subject,
      html,
      category: "Hotel Booking",
      // sandbox: true, // ⛔ REMOVE or comment this if you're emailing Gmail/outside inbox
    });
    console.log("✅ Mail sent to:", to);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

export default sendMail;
