import 'dotenv/config';
import { createServer } from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/myapp');
  const server = createServer(app);

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'}`);
  });

  // graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Closed out remaining connections');
      process.exit(0);
    });
  });
})();
