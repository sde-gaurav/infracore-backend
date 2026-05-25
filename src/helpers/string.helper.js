'use strict';

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '');

const toTitleCase = (str) =>
  str
    ? str
        .toLowerCase()
        .split(' ')
        .map((word) => capitalize(word))
        .join(' ')
    : '';

const toSlug = (str) =>
  str
    ? str
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
    : '';

const truncate = (str, maxLength = 100, suffix = '...') => {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - suffix.length)}${suffix}`;
};

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  const maskedLocal = local.length <= 2 ? '**' : `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, '');
  return `${'*'.repeat(digits.length - 4)}${digits.slice(-4)}`;
};

const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const stripHtml = (html) => html.replace(/<[^>]*>/g, '');

module.exports = { capitalize, toTitleCase, toSlug, truncate, maskEmail, maskPhone, generateRandomString, stripHtml };
