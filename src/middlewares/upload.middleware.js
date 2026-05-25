const path = require('path');

const multer = require('multer');

const config = require('../config');
const ApiError = require('../core/ApiError');
const { generateUniqueFilename, ensureDirectoryExists } = require('../helpers/file.helper');

const buildStorage = (destination) => {
  const uploadDir = destination || path.resolve(config.upload.path);
  ensureDirectoryExists(uploadDir);

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, generateUniqueFilename(file.originalname)),
  });
};

const buildFileFilter = (allowedTypes) => (req, file, cb) => {
  const types = allowedTypes || config.upload.allowedTypes;
  if (types.includes(file.mimetype)) return cb(null, true);
  return cb(ApiError.badRequest(`File type '${file.mimetype}' is not allowed.`), false);
};

/**
 * Creates a configured Multer instance.
 *
 * @param {object} options
 * @param {string}   options.destination — upload directory (defaults to config.upload.path)
 * @param {number}   options.maxSize     — max file size in bytes
 * @param {string[]} options.allowedTypes — allowed MIME types
 */
const createUploader = ({ destination, maxSize, allowedTypes } = {}) => multer({
  storage: buildStorage(destination),
  limits: { fileSize: maxSize || config.upload.maxFileSize },
  fileFilter: buildFileFilter(allowedTypes),
});

// Pre-built uploaders for common use-cases
const avatarUpload = createUploader({ allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] });
const documentUpload = createUploader({ allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'] });

module.exports = { createUploader, avatarUpload, documentUpload };
