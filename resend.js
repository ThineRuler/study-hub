require('dotenv').config();
const { Resend } = require('resend');
const { EMAIL_TEMPLATES } = require('./utils/email.templates.js');

let resendClient = null;
const getResendClient = () => {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is missing from environment variables');
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const sendEmail = async ({ to, type, data }) => {
  if (!to || !type) throw new Error('Missing parameters for email delivery');

  const templateGenerator = EMAIL_TEMPLATES[type];
  if (!templateGenerator) {
    throw new Error(`Invalid email template type: ${type}`);
  }

  const { subject, html } = templateGenerator(data);
  const client = getResendClient();
  const fromAddress = process.env.RESEND_FROM || 'StudyHub <onboarding@resend.dev>';

  const { data: result, error } = await client.emails.send({
    from: fromAddress,
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error('Resend API error:', error);
    throw new Error(error.message || 'Failed to send email via Resend');
  }

  console.log(`Email successfully sent via Resend API to ${to}, id:`, result?.id);
  return result;
};

module.exports = {
  sendEmail,
};

