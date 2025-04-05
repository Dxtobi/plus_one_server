import { Schema, model } from 'mongoose';

const gigSchema = new Schema({
  title: { type: String, required: true },
  displayname: { type: String },
  description: { type: String, required: true },
  platform: { type: String, required: true }, 
  reward: { type: Number, required: true },
  url: { type: String, required: true },
  duration: { type: Number, required: true }, 
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  completedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  reactivatedAt: { type: Date, default: null }, 
});

gigSchema.methods.reactivate = function (newDuration) {
  if (!newDuration || newDuration <= 0) {
    throw new Error('Invalid duration. Duration must be greater than 0.');
  }

  const now = new Date();
  this.duration = newDuration; 
  this.reactivatedAt = now; 
  this.expiresAt = new Date(now.getTime() + newDuration * 60 * 60 * 1000); 
  this.isActive = true; 
};

gigSchema.pre('save', function (next) {
  const now = new Date();
  if (this.expiresAt && now > this.expiresAt) {
    this.isActive = false; 
  }
  next();
});

export default model('Gig', gigSchema);