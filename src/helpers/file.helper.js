const fs = require('fs');
const path = require('path');

const getFileExtension = (filename) => path.extname(filename).toLowerCase();

const getFileSizeInMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

const isValidFileType = (mimetype, allowedTypes) => allowedTypes.includes(mimetype);

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

const generateUniqueFilename = (originalName) => {
  const ext = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
};

module.exports = { getFileExtension, getFileSizeInMB, isValidFileType, ensureDirectoryExists, deleteFile, generateUniqueFilename };
