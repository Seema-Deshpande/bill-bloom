import { findByEmail, findByUsername, createUser } from '../services/authService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email and password are required' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'password must be at least 6 characters' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'invalid email' });
  }

  try {
    const existingEmail = await findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: 'email already in use' });
    }
    const existingUsername = await findByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ message: 'username already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await createUser({ username, email, password: hashedPassword });

    return res.status(201).json({
      message: 'user created',
      user: { id: user._id, username: user.username, email: user.email, createdAt: user.createdAt }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  try {
    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.EXPIRES_IN });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    // The user object is attached to the request by the auth middleware
    const user = req.user;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'server error' });
  }
};