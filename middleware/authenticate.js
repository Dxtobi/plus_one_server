// middleware/authenticate.js
import { verify } from 'jsonwebtoken';
import { findById } from '../models/User';

export default async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = await findById(decoded.id);
    if (!req.user) throw new Error();
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
