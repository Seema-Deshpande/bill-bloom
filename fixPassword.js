import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const email = 'test@example.com';
const plainPassword = 'test123'; // change this to the actual plain-text password stored in DB

const fix = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB...');

  let user = await User.findOne({ email });
  const salt = await bcrypt.genSalt(10);

  if (!user) {
    console.log(`No user found with email: ${email}. Creating user...`);
    const hashed = await bcrypt.hash(plainPassword, salt);
    user = new User({ username: 'testuser', email, password: hashed });
    await user.save();
    console.log(`User created: ${email} with password: ${plainPassword}`);
    process.exit(0);
  }

  const isAlreadyHashed = user.password.startsWith('$2');
  if (isAlreadyHashed) {
    console.log('Password is already hashed. No fix needed.');
    process.exit(0);
  }

  const hashed = await bcrypt.hash(user.password, salt); // hash whatever plain text is stored
  user.password = hashed;
  await user.save();

  console.log(`Password for ${email} has been hashed and updated successfully.`);
  process.exit(0);
};

fix().catch((err) => {
  console.error(err);
  process.exit(1);
});
