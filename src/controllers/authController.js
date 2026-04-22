import { findByEmail, findByUsername, createUser } from '../services/authService.js';

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

    const user = await createUser({ username, email, password: password });

    return res.status(201).json({
      message: 'user created',
      user: { id: user._id, username: user.username, email: user.email, createdAt: user.createdAt }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'server error' });
  }
};