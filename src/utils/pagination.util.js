'use strict';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Parses and normalises pagination parameters from an Express request.
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Builds a standard pagination meta object.
 */
const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

/**
 * Builds a MongoDB sort object from query string.
 * e.g. ?sort=-createdAt,firstName → { createdAt: -1, firstName: 1 }
 */
const parseSort = (sortQuery, defaultSort = { createdAt: -1 }) => {
  if (!sortQuery) return defaultSort;

  return sortQuery.split(',').reduce((acc, field) => {
    const order = field.startsWith('-') ? -1 : 1;
    acc[field.replace(/^-/, '')] = order;
    return acc;
  }, {});
};

/**
 * Parses field selection from query string.
 * e.g. ?fields=firstName,lastName,email → 'firstName lastName email'
 */
const parseFieldSelection = (fieldsQuery) => {
  if (!fieldsQuery) return null;
  return fieldsQuery.split(',').join(' ');
};

module.exports = { parsePagination, buildPaginationMeta, parseSort, parseFieldSelection };
