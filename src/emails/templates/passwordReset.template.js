'use strict';

const config = require('../../config');

const passwordResetTemplate = ({ firstName, resetUrl }) => ({
  subject: `Reset your ${config.app.name} password`,
  html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f6f9; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #1a1a2e; padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .body { padding: 32px; color: #333; }
    .body p { line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #dc2626; color: #fff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .warning { background: #fef9c3; border-left: 4px solid #eab308; padding: 12px 16px; border-radius: 4px; font-size: 14px; }
    .footer { background: #f4f6f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>${config.app.name}</h1></div>
    <div class="body">
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>We received a request to reset the password for your account. Click the button below to proceed:</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <div class="warning">This link expires in <strong>30 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.</div>
    </div>
    <div class="footer"><p>&copy; ${new Date().getFullYear()} ${config.app.name}</p></div>
  </div>
</body>
</html>`,
  text: `Hi ${firstName},\n\nReset your password here: ${resetUrl}\n\nThis link expires in 30 minutes.`,
});

module.exports = passwordResetTemplate;
