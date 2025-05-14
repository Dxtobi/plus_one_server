

// server.js
import express, { json } from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import gigRoutes from './routes/gigRoutes.js';
import userRoutes from './routes/usersRoutes.js';
import transactionRoutes from './routes/transactionsRoutes.js';
import paymentRoutes from './routes/payments.js';


import os from 'os';


config();

const app = express();
app.use(json());
console.log(process.env.MONGO_URI)
// Connect to MongoDB
connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err.message));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', transactionRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const networkInterfaces = os.networkInterfaces();
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`Network: http://${iface.address}:${PORT}`);
      }
    });
  });
  console.log(`Server running on port ${PORT}`);
  
});







