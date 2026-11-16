import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config/env.js';
import { checkPostGIS, pool } from './config/db.js';
import { setupSocketIO } from './sockets/socketHandler.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  const app = createApp();
  const httpServer = http.createServer(app);

  // Setup Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [config.clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  setupSocketIO(io);

  // Check database and PostGIS capabilities
  const postgisReady = await checkPostGIS();
  logger.info(`[Database] Connected to PostgreSQL on port ${config.db.port}`);
  logger.info(`[Database] PostGIS spatial queries: ${postgisReady ? 'ACTIVE' : 'FALLBACK (Haversine trigonometric mode)'}`);

  httpServer.listen(config.port, () => {
    logger.info(`🚀 LocalLoop Backend running on http://localhost:${config.port}`);
    logger.info(`📡 Socket.IO WebSocket ready on ws://localhost:${config.port}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down server gracefully...');
    httpServer.close(async () => {
      await pool.end();
      logger.info('Database pool closed. Exiting process.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});

