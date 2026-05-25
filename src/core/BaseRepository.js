'use strict';

const ApiError = require('./ApiError');

/**
 * Generic repository implementing standard CRUD operations against a Mongoose model.
 * Domain repositories extend this class and override or augment as needed.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, projection = null, options = {}) {
    const doc = await this.model.findById(id, projection, options);
    return doc;
  }

  async findOne(filter, projection = null, options = {}) {
    return this.model.findOne(filter, projection, options);
  }

  async findAll(filter = {}, options = {}) {
    const { projection, sort, skip, limit, populate } = options;
    let query = this.model.find(filter, projection);

    if (sort) query = query.sort(sort);
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);
    if (populate) query = query.populate(populate);

    return query.lean();
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async create(data) {
    const doc = await this.model.create(data);
    return doc;
  }

  async createMany(data) {
    return this.model.insertMany(data, { ordered: false });
  }

  async updateById(id, update, options = { new: true, runValidators: true }) {
    const doc = await this.model.findByIdAndUpdate(id, update, options);
    if (!doc) throw ApiError.notFound(`${this.model.modelName} not found`);
    return doc;
  }

  async updateOne(filter, update, options = { new: true, runValidators: true }) {
    return this.model.findOneAndUpdate(filter, update, options);
  }

  async updateMany(filter, update) {
    return this.model.updateMany(filter, update);
  }

  async deleteById(id) {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) throw ApiError.notFound(`${this.model.modelName} not found`);
    return doc;
  }

  async deleteOne(filter) {
    return this.model.findOneAndDelete(filter);
  }

  async deleteMany(filter) {
    return this.model.deleteMany(filter);
  }

  async exists(filter) {
    return this.model.exists(filter);
  }

  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }

  // Paginated query helper
  async paginate(filter = {}, { page = 1, limit = 10, sort = { createdAt: -1 }, populate, projection } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.findAll(filter, { sort, skip, limit, populate, projection }),
      this.count(filter),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }
}

module.exports = BaseRepository;
