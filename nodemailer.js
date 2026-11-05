require('dotenv').config();
const nodemailer = require('nodemailer');
const { EMAIL_TEMPLATES } = require('./utils/email.templates.js');

const transporter = nodemailer.createTransport({
  service: process.env.DOMAIN,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async ({ to, type, data }) => {
  if (!to || !type) throw new Error('Missing parameters');

  const templateGenerator = EMAIL_TEMPLATES[type];

  if (!templateGenerator) {
    throw new Error(`Invalid email template type: ${type}`);
  }

  const { subject, html } = templateGenerator(data);

  const mailOptions = {
    from: `"Study Hub" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Message sent: %s', info.messageId);
  return info;
};

module.exports = {
  sendEmail,
};