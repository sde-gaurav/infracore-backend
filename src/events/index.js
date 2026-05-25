'use strict';

const EventEmitter = require('events');

const logger = require('../config/logger');

class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }
}

const emitter = new AppEventEmitter();

// Log unhandled emitter errors
emitter.on('error', (err) => logger.error(`EventEmitter error: ${err.message}`));

module.exports = emitter;