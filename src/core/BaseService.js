/**
 * Thin service base class.
 * Provides a uniform constructor signature (repository injection) and a hook
 * for subclasses to declare their repository dependency.
 */
class BaseService {
  constructor(repository) {
    this.repository = repository;
  }
}

module.exports = BaseService;
