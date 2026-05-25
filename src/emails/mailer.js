'use strict';

const { getTransporter } = require('../config/email');
const config = require('../config');
const logger = require('../config/logger');

const welcomeTemplate = require('./templates/welcome.template');
const otpTemplate = require('./templates/otp.template');
const passwordResetTemplate = require('./templates/passwordReset.template');

const sendMail = async ({ to, subject, html, text }) => {
  try {
    const info = await getTransporter().sendMail({
      from: `"${config.email.fromName}" <${config.email.from}>`,
      to,
      subject,
      html,
      text,
    });

    logger.info(`Email sent to ${to} — messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err.message}`);
    throw err;
  }
};

const sendWelcomeEmail = (user, verificationToken) => {
  const verificationUrl = `${config.app.clientUrl}/verify-email?token=${verificationToken}`;
  const tmpl = welcomeTemplate({ firstName: user.firstName, email: user.email, verificationUrl });
  return sendMail({ to: user.email, ...tmpl });
};

const sendOTPEmail = (user, otp) => {
  const tmpl = otpTemplate({ firstName: user.firstName, otp });
  return sendMail({ to: user.email, ...tmpl });
};

const sendPasswordResetEmail = (user, resetToken) => {
  const resetUrl = `${config.app.clientUrl}/reset-password?token=${resetToken}`;
  const tmpl = passwordResetTemplate({ firstName: user.firstName, resetUrl });
  return sendMail({ to: user.email, ...tmpl });
};

module.exports = { sendMail, sendWelcomeEmail, sendOTPEmail, sendPasswordResetEmail };
