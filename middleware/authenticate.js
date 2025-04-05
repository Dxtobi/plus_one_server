// middleware/authenticate.js
import pkg from 'jsonwebtoken';
const { verify } = pkg;
import UserSchema from '../models/User.js';

export default async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });
  // console.log(token)
  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = await UserSchema.findById(decoded.id);
    if (!req.user) throw new Error();
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
