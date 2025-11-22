import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// Initialize database connection (with caching for serverless)
let dbConnected = false;

const initDB = async () => {
  if (!dbConnected) {
    try {
      await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/myapp');
      dbConnected = true;
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }
};

// Initialize DB on first request
initDB();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('dev'));

// Rate limiter (basic)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.get('/', (req, res) => res.json({ message: 'API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Error handler (last)
app.use(errorHandler);

export default app;