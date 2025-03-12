

// server.js
import express, { json } from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import authRoutes from './routes/authRoutes';
import gigRoutes from './routes/gigRoutes';

config();

const app = express();
app.use(json());

// Connect to MongoDB
connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));







