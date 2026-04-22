import User from '../models/User.js';

export const findByEmail = (email) => User.findOne({ email });

export const findByUsername = (username) => User.findOne({ username });

export const createUser = (userData) => {
  const user = new User(userData);
  return user.save();
};