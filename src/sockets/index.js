'use strict';

const { Server } = require('socket.io');

const config = require('../config');
const logger = require('../config/logger');
const socketAuthMiddleware = require('./socket.auth');
const { registerSocketHandlers } = require('./socket.handler');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6,
  });

  // Authentication middleware — runs before every connection
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    logger.info(`New socket connection: ${socket.id} (user: ${socket.userId})`);
    registerSocketHandlers(io, socket);
  });

  io.on('error', (err) => logger.error(`Socket.IO server error: ${err.message}`));

  logger.info('Socket.IO initialised');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO has not been initialised. Call initSocket(server) first.');
  return io;
};

module.exports = { initSocket, getIO };
