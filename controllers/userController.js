// controllers/userController.js
import { sign } from 'jsonwebtoken';
import { compare } from 'bcryptjs';
import { findOne, create } from '../models/User';

export async function register(req, res) {
  const { username, email, password } = req.body;

  try {
    const existingUser = await findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const user = await create({ username, email, password });
    const token = sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await findOne({ email });
    if (!user || !(await compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

