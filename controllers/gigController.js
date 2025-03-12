
// controllers/gigController.js
import { create, findById } from '../models/Gig';
import User from '../models/User';

const POINT_REQUIREMENTS = {
  6: 1000,
  12: 5000,
  25: 10000,
  48: 20000,
  168: 150000, // 1 week
  720: 300000, // 1 month
};

export async function createGig(req, res) {
  const { title, description, platform, reward, duration } = req.body;

  try {
    if (!POINT_REQUIREMENTS[duration] || req.user.points < POINT_REQUIREMENTS[duration]) {
      return res.status(400).json({ message: 'Insufficient points for the selected duration' });
    }

    const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);
    const gig = await create({
      title,
      description,
      platform,
      reward,
      duration,
      creator: req.user._id,
      expiresAt,
    });

    req.user.points -= POINT_REQUIREMENTS[duration];
    await req.user.save();

    res.status(201).json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function completeGig(req, res) {
  try {
    const gig = await findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    req.user.points += gig.reward;
    await req.user.save();

    res.status(200).json({ message: 'Gig completed', points: req.user.points });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

