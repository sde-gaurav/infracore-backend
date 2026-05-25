const { parseSort, parseFieldSelection } = require('./pagination.util');

/**
 * Fluent query builder that progressively applies filter, sort, field-select,
 * and pagination from an Express request's query string onto a Mongoose Query.
 *
 * Usage:
 *   const features = new ApiFeatures(Model.find(), req.query)
 *     .filter()
 *     .sort()
 *     .selectFields()
 *     .paginate();
 *   const results = await features.query;
 */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    const queryObj = { ...this.queryString };
    excludedFields.forEach((field) => delete queryObj[field]);

    // Convert comparison operators: gt → $gt, gte → $gte, etc.
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|nin|ne|eq)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(searchableFields = []) {
    if (this.queryString.search && searchableFields.length) {
      const regex = new RegExp(this.queryString.search, 'i');
      const searchConditions = searchableFields.map((field) => ({ [field]: regex }));
      this.query = this.query.find({ $or: searchConditions });
    }
    return this;
  }

  sort() {
    const sortObj = parseSort(this.queryString.sort);
    this.query = this.query.sort(sortObj);
    return this;
  }

  selectFields() {
    const fields = parseFieldSelection(this.queryString.fields);
    if (fields) this.query = this.query.select(fields);
    return this;
  }

  paginate() {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(this.queryString.limit, 10) || 10));
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    this._page = page;
    this._limit = limit;
    return this;
  }
}

module.exports = ApiFeatures;
