import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

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
