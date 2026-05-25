'use strict';

const addDays = (date, days) => new Date(new Date(date).getTime() + days * 24 * 60 * 60 * 1000);

const addHours = (date, hours) => new Date(new Date(date).getTime() + hours * 60 * 60 * 1000);

const addMinutes = (date, minutes) => new Date(new Date(date).getTime() + minutes * 60 * 1000);

const isExpired = (date) => !date || new Date() > new Date(date);

const toUnixTimestamp = (date) => Math.floor(new Date(date).getTime() / 1000);

const fromUnixTimestamp = (unix) => new Date(unix * 1000);

const formatDate = (date, locale = 'en-US', options = {}) =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(new Date(date));

const diffInMs = (dateA, dateB = new Date()) => Math.abs(new Date(dateA) - new Date(dateB));

const diffInMinutes = (dateA, dateB = new Date()) => Math.floor(diffInMs(dateA, dateB) / (1000 * 60));

const diffInDays = (dateA, dateB = new Date()) => Math.floor(diffInMs(dateA, dateB) / (1000 * 60 * 60 * 24));

module.exports = { addDays, addHours, addMinutes, isExpired, toUnixTimestamp, fromUnixTimestamp, formatDate, diffInMs, diffInMinutes, diffInDays };
