
// controllers/gigController.js
import GigSchema from '../models/Gig.js';
import Transaction from '../models/Transaction.js';
import UserSchema from '../models/User.js';

const POINT_REQUIREMENTS = {
  1: 500,    // 1 hour
  6: 2800,    // 6 hours
  12: 4600,   // 12 hours
  24: 6400,  // 1 day
  48: 8200,  // 2 days
  168: 10000  // 1 week
};

export async function createGig(req, res) {
  const { title, description, platform,  duration, url, displayname} = req.body;
  //  console.log(req.user)
  try {
    if (!POINT_REQUIREMENTS[duration] || req.user.balance < POINT_REQUIREMENTS[duration]) {
      console.log(req.user.balance, POINT_REQUIREMENTS[duration])
      return res.status(400).json({ message: 'Insufficient points for the selected duration' });
    }
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const gigDescription = description || 'follow link'; 
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000); // duration in hours
    const gig = await GigSchema.create({
      title,
      displayname,
      description:gigDescription,
      platform,
      reward:10,
      url,
      duration,
      creator: req.user._id,
      expiresAt,
      isActive: true,
    });


    const transactions = await Transaction.create({
      user: req.user._id,
      type: 'purchase',
      amount: POINT_REQUIREMENTS[duration],
      currency: 'NGN',
      status: 'completed',
      description: `Created gig: ${title}`,
      relatedGig: gig._id,
      balanceBefore: req.user.balance,
      balanceAfter: req.user.balance - POINT_REQUIREMENTS[duration],
      date: new Date(),
    });
    
    req.user.balance -= POINT_REQUIREMENTS[duration];
    await req.user.save();

    res.status(201).json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function completeGig(req, res) {
  try {
    const gig = await GigSchema.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    // console.log(gig)
    req.user.points += gig.reward;
    if (!gig.completedBy.includes(req.user._id)) {
      gig.completedBy.push(req.user._id);
    } 
    await Transaction.create({
      user: req.user._id,
      type: 'gig_reward',
      amount: gig.reward,
      currency: 'Points',
      status: 'completed',
      description: `Completed gig: ${gig.title}`,
      relatedGig: gig._id,
      balanceBefore: req.user.points,
      balanceAfter: req.user.points,
      date: new Date(),
    });
    await gig.save();
    await req.user.save();
    
    res.status(200).json({ message: 'Gig completed', points: req.user.points });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getGigs(req, res) {
  const { from } = req.query;
  try {
    const dateFrom = new Date(from);
    if (isNaN(dateFrom)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const dateTo = new Date(dateFrom);
    dateTo.setDate(dateTo.getDate() + 1);
    const gigs = await GigSchema.find({ 
      createdAt: { $gte: dateFrom, $lt: dateTo },
      completedBy: { $ne: req.user._id },
      // $or: [
      //   { duration: { $lte: 24 } },
      //   { $and: [{ duration: { $gt: 24 } }, { 'completedBy.99': { $exists: false } }] }
      // ]
        });
    // console.log(gigs)
    res.status(200).json({data:gigs, id:req?.user?._id});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function reactivateGig(req, res) {
  const { from } = req.query;
  try {
    const dateFrom = new Date(from);
    if (isNaN(dateFrom)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const dateTo = new Date(dateFrom);
    dateTo.setDate(dateTo.getDate() + 1);
    const gigs = await GigSchema.find({ createdAt: { $gte: dateFrom, $lt: dateTo } });
    // console.log(gigs)
    res.status(200).json({data:gigs, id:req?.user?._id});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}