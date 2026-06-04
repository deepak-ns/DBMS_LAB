const nodemailer = require("nodemailer");
const { eventEmailBody } = require("./formatters");

const createTransporter = () => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) return null;

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

const sendEmail = async (to, subject, text) => {
  const transporter = createTransporter();
  if (!transporter || !to) return;

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
  });
};

const sendEventEmail = async (to, event, action) => {
  await sendEmail(to, `Event ${action}: ${event.title}`, eventEmailBody(event));
};

module.exports = { sendEmail, sendEventEmail };
