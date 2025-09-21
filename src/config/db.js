import { connect } from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async (mongoUri) => {
  try {
    await connect(mongoUri);
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;
