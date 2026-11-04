const EMAIL_TEMPLATES = {
  VERIFICATION: ({ name, verificationUrl }) => ({
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Welcome to the platform, ${name}!</h2>
        <p>Please confirm your account by clicking the link below:</p>
        <p>
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 18px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p>If you didn't create an account, you can safely ignore this message.</p>
      </div>
    `,
  }),

  PASSWORD_RESET: ({ name, resetUrl }) => ({
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Click the link below to choose a new one:</p>
        <p>
          <a href="${resetUrl}" style="background-color: #d9534f; color: white; padding: 10px 18px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>This link is valid for 15 minutes. If you did not request this, please secure your account immediately.</p>
      </div>
    `,
  }),
};

module.exports = {
  EMAIL_TEMPLATES,
};