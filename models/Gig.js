// models/Gig.js
import { Schema, model } from 'mongoose';

const gigSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  platform: { type: String, required: true }, // e.g., Instagram, WhatsApp, etc.
  reward: { type: Number, required: true },
  duration: { type: Number, required: true }, // in hours
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

export default model('Gig', gigSchema);

