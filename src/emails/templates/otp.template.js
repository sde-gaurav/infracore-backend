const config = require('../../config');

const otpTemplate = ({ firstName, otp, expiryMinutes }) => ({
  subject: `Your ${config.app.name} verification code: ${otp}`,
  html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f6f9; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #1a1a2e; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .body { padding: 32px; color: #333; text-align: center; }
    .otp-box { display: inline-block; background: #f0f4ff; border: 2px dashed #4f46e5; border-radius: 8px; padding: 20px 40px; margin: 16px 0; }
    .otp-code { font-size: 40px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; margin: 0; }
    .footer { background: #f4f6f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>${config.app.name}</h1></div>
    <div class="body">
      <p>Hi <strong>${firstName}</strong>, here is your verification code:</p>
      <div class="otp-box"><p class="otp-code">${otp}</p></div>
      <p>This code expires in <strong>${expiryMinutes || config.otp.expiryMinutes} minutes</strong>.</p>
      <p>If you didn't request this, please ignore this message.</p>
    </div>
    <div class="footer"><p>&copy; ${new Date().getFullYear()} ${config.app.name}</p></div>
  </div>
</body>
</html>`,
  text: `Your ${config.app.name} OTP: ${otp}\n\nExpires in ${expiryMinutes || config.otp.expiryMinutes} minutes.`,
});

module.exports = otpTemplate;
