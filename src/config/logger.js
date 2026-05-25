const path = require('path');

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const config = require('./index');

const { combine, timestamp, errors, json, colorize, printf, splat } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const base = `${ts} [${level}]: ${stack || message}`;
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${base}${metaStr}`;
});

const transports = [];

// Console transport — human-readable in dev, JSON in production
if (config.isDevelopment || config.isTest) {
  transports.push(
    new winston.transports.Console({
      format: combine(colorize({ all: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), splat(), logFormat),
    }),
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: combine(timestamp(), errors({ stack: true }), splat(), json()),
    }),
  );
}

// Rotating file transports — always active in non-test environments
if (!config.isTest) {
  transports.push(
    new DailyRotateFile({
      filename: path.join(config.log.dir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: config.log.maxSize,
      maxFiles: config.log.maxFiles,
      format: combine(timestamp(), errors({ stack: true }), json()),
      zippedArchive: true,
    }),
    new DailyRotateFile({
      filename: path.join(config.log.dir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: config.log.maxSize,
      maxFiles: config.log.maxFiles,
      format: combine(timestamp(), errors({ stack: true }), json()),
      zippedArchive: true,
    }),
  );
}

const logger = winston.createLogger({
  level: config.log.level,
  defaultMeta: { service: config.app.name },
  transports,
  exitOnError: false,
});

// Stream adapter for Morgan HTTP request logger
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
