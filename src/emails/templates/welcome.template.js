const config = require('../../config');

const welcomeTemplate = ({ firstName, email, verificationUrl }) => ({
  subject: `Welcome to ${config.app.name}!`,
  html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ${config.app.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f6f9; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #1a1a2e; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .body { padding: 32px; color: #333; }
    .body p { line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #4f46e5; color: #fff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { background: #f4f6f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${config.app.name}</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>Welcome aboard! Your account has been created successfully.</p>
      <p>Please verify your email address to activate your account:</p>
      <a href="${verificationUrl}" class="btn">Verify Email Address</a>
      <p>This link expires in <strong>24 hours</strong>. If you didn't create an account, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${config.app.name}. All rights reserved.</p>
      <p>This is an automated message — please do not reply.</p>
    </div>
  </div>
</body>
</html>`,
  text: `Welcome to ${config.app.name}!\n\nHi ${firstName},\n\nVerify your email here: ${verificationUrl}\n\nThis link expires in 24 hours.`,
});

module.exports = welcomeTemplate;
