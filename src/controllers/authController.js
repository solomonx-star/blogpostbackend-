import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const register = async(req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const hashed = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ username, email, password: hashed });
    const token = signToken(user);

    res.status(201).json({ statusCode: 201, message: "success", user: { id: user._id, username: user.username, email: user.email }, token });
  } catch (err) {
    next(err);
  }
}

export const login = async(req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ statusCode: 200, message: "success", user: { id: user._id, username: user.username, email: user.email }, token });
  } catch (err) {
    next(err);
  }
}


export const getProfile = async(req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ statusCode: 200, message: "success", user });
  } catch (err) {
    next(err);
  }
}

export const logout = async(req, res, next) => {
  try {
    // Clear the auth cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    res.status(200).json({ 
      statusCode: 200,
      message: 'Logged out successfully' 
    });
  } catch (err) {
    next(err);
  }
}
