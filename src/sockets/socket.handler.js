const logger = require('../config/logger');

const registerSocketHandlers = (io, socket) => {
  const { userId, userRole } = socket;

  // Join the user's personal room for targeted messages
  socket.join(`user:${userId}`);

  // Join role-based room for broadcast messages
  socket.join(`role:${userRole}`);

  logger.info(`Socket ${socket.id} joined rooms: user:${userId}, role:${userRole}`);

  // ---- Ping / heartbeat ----
  socket.on('ping', (cb) => {
    if (typeof cb === 'function') cb({ pong: true, timestamp: Date.now() });
  });

  // ---- Notifications ----
  socket.on('notification:ack', ({ notificationId }) => {
    logger.info(`Notification ${notificationId} acknowledged by user ${userId}`);
    // TODO: mark notification as read in database
  });

  // ---- Cleanup ----
  socket.on('disconnect', (reason) => {
    logger.info(`Socket ${socket.id} disconnected: ${reason}`);
  });

  socket.on('error', (err) => {
    logger.error(`Socket error for user ${userId}: ${err.message}`);
  });
};

// Helper: send a notification to a specific user
const notifyUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Helper: broadcast to a role group
const broadcastToRole = (io, role, event, data) => {
  io.to(`role:${role}`).emit(event, data);
};

module.exports = { registerSocketHandlers, notifyUser, broadcastToRole };
