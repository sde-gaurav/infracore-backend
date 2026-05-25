'use strict';

const { HTTP_STATUS } = require('../constants/http.constant');

class ApiResponse {
  constructor(statusCode, message, data = null, meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
  }

  send(res) {
    return res.status(this.statusCode).json(this.toJSON());
  }

  toJSON() {
    const payload = {
      success: this.success,
      message: this.message,
    };
    if (this.data !== undefined) payload.data = this.data;
    if (this.meta !== undefined) payload.meta = this.meta;
    return payload;
  }

  // ---- Factory helpers ----

  static ok(res, message, data, meta) {
    return new ApiResponse(HTTP_STATUS.OK, message, data, meta).send(res);
  }

  static created(res, message, data) {
    return new ApiResponse(HTTP_STATUS.CREATED, message, data).send(res);
  }

  static noContent(res) {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  static paginated(res, message, data, pagination) {
    return new ApiResponse(HTTP_STATUS.OK, message, data, { pagination }).send(res);
  }
}

module.exports = ApiResponse;
