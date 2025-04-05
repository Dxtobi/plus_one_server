import cron from 'node-cron';
import Gig from './models/Gig.js';
import Redis from 'ioredis';
import Redlock from 'redlock';

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

// Initialize Redlock for distributed locking
const redlock = new Redlock([redis], {
  driftFactor: 0.01, // Time drift factor
  retryCount: 10,    // Retry count for acquiring the lock
  retryDelay: 200,   // Delay between retries (in ms)
  retryJitter: 200,  // Jitter to add randomness to retries
});

// Define the lock resource key
const LOCK_KEY = 'gig-expiration-lock';
const LOCK_TTL = 60 * 1000; // Lock TTL in milliseconds (1 minute)

// Run every hour to check for expired gigs
cron.schedule('0 * * * *', async () => {
  try {
    // Attempt to acquire a distributed lock
    const lock = await redlock.acquire([LOCK_KEY], LOCK_TTL);

    console.log('Acquired lock for gig expiration check.');

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // Calculate 2 days ago

    // Step 1: Mark gigs as inactive if they have expired
    const markInactiveResult = await Gig.updateMany(
      { expiresAt: { $lt: now }, isActive: true }, // Find gigs that have expired but are still active
      { $set: { isActive: false } } // Mark them as inactive
    );
    console.log(`Marked ${markInactiveResult.modifiedCount} gigs as inactive.`);

    // Step 2: Delete gigs that expired more than 2 days ago
    const deleteResult = await Gig.deleteMany(
      { expiresAt: { $lt: twoDaysAgo } } // Find gigs that expired more than 2 days ago
    );
    console.log(`Deleted ${deleteResult.deletedCount} expired gigs.`);

    // Release the lock after the task is done
    await lock.release();
    console.log('Released lock for gig expiration check.');
  } catch (error) {
    if (error.name === 'LockError') {
      console.log('Could not acquire lock. Another worker is handling the task.');
    } else {
      console.error('Error during gig expiration check:', error.message);
    }
  }
});