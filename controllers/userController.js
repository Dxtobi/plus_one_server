// controllers/userController.js
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { compare } from 'bcryptjs';
import UserSchema from '../models/User.js';

export async function register(req, res) {
  const { username, email, password } = req.body;

  try {
    const existingUser = await UserSchema.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const existingUserWithUserName = await UserSchema.findOne({ username });
    if (existingUserWithUserName) return res.status(400).json({ message: 'Username already exists' });

    const user = await UserSchema.create({ username, email, password });
    const token = sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await UserSchema.findOne({ email });
    if (!user || !(await compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = sign({ id: user._id, username:user.username, pnt:user.points, balance:user.balance }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function get_my_profile(req, res) {
  try {
    const user = await UserSchema.findById(req?.user?.id).select('-password').lean();
    const user_ = {
      point_balance_ngn:user.points * 10,
      ...user
    }
  
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user_);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

