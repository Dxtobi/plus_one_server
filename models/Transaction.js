import { Schema, model, Document } from 'mongoose';

/**
 * Transaction Schema
 * 
 * Represents a financial or points-based transaction in the system.
 * 
 * @typedef {Object} Transaction
 * @property {ObjectId} user - Reference to the user associated with the transaction.
 * @property {string} type - The type of transaction. Possible values:
 *   - 'deposit': Adding funds (NGN).
 *   - 'withdrawal': Cashing out (NGN).
 *   - 'purchase': Spending NGN or Points on a service (e.g., gig boost).
 *   - 'transfer_in': Receiving NGN or Points from another user.
 *   - 'transfer_out': Sending NGN or Points to another user.
 *   - 'gig_reward': Earning Points for completing a gig.
 *   - 'points_conversion_to_cash': Converting Points to NGN.
 *   - 'cash_conversion_to_points': Converting NGN to Points.
 *   - 'refund': Refund for a purchase or fee.
 *   - 'fee': System fees (e.g., withdrawal fee).
 *   - 'adjustment': Manual admin adjustment.
 * @property {number} amount - The transaction amount. Must be positive.
 * @property {string} currency - The currency of the transaction. Possible values: 'NGN', 'Points'.
 * @property {string} status - The status of the transaction. Possible values:
 *   - 'pending': Transaction is awaiting processing.
 *   - 'completed': Transaction was successfully processed.
 *   - 'failed': Transaction failed.
 *   - 'cancelled': Transaction was cancelled.
 *   - 'reversed': Transaction was reversed.
 * @property {string} [description] - Optional description of the transaction.
 * @property {string} [transactionReference] - Unique identifier for the transaction. Auto-generated if not provided.
 * @property {string} [paymentGateway] - The payment gateway used for the transaction (e.g., Paystack, Flutterwave, Stripe, or 'System' for internal).
 * @property {string} [gatewayTransactionId] - The ID from the external payment processor.
 * @property {ObjectId} [relatedGig] - Reference to a gig if the transaction is related to a gig purchase or reward.
 * @property {ObjectId} [relatedUser] - Reference to another user involved in the transaction (e.g., recipient or sender for transfers).
 * @property {number} balanceBefore - The user's balance (in the specified currency) before the transaction was applied.
 * @property {number} balanceAfter - The user's balance (in the specified currency) after the transaction was applied.
 * @property {Object} [metadata] - Additional metadata for the transaction (e.g., IP address, device info for fraud detection).
 * @property {string} [notes] - Internal notes for admin or support purposes.
 * @property {Date} [processedAt] - The timestamp when the transaction status moved from pending to a final state.
 * @property {Date} createdAt - The timestamp when the transaction was created (auto-generated).
 * @property {Date} updatedAt - The timestamp when the transaction was last updated (auto-generated).
 */
const transactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for faster queries by user
  },
  type: {
    type: String,
    required: true,
    enum: [
      'deposit',          // Adding funds (NGN)
      'withdrawal',       // Cashing out (NGN)
      'purchase',         // Spending NGN or Points on a service (e.g., gig boost)
      'transfer_in',      // Receiving NGN or Points from another user
      'transfer_out',     // Sending NGN or Points to another user
      'gig_reward',       // Earning Points for completing a gig
      'points_conversion_to_cash', // Converting Points to NGN
      'cash_conversion_to_points', // Converting NGN to Points
      'refund',           // Refund for a purchase or fee
      'fee',              // System fees (e.g., withdrawal fee)
      'adjustment',       // Manual admin adjustment
    ],
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Transaction amount must be positive'], // Usually amounts are positive, type indicates direction
  },
  currency: {
    type: String,
    required: true,
    enum: ['NGN', 'Points'],
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'reversed'],
    default: 'pending',
    index: true,
  },
  description: {
    type: String,
  },
  transactionReference: { // Unique identifier for this transaction
    type: String,
    unique: true,
    sparse: true, // Allows multiple nulls but unique if value exists
    // You might want to auto-generate this using a pre-save hook or in your service layer
  },
  paymentGateway: { // e.g., Paystack, Flutterwave, Stripe, or 'System' for internal
    type: String,
  },
  gatewayTransactionId: { // ID from the external payment processor
    type: String,
    index: true,
  },
  relatedGig: { // Link to a gig if the transaction is for a gig purchase/reward
    type: Schema.Types.ObjectId,
    ref: 'Gig',
  },
  relatedUser: { // For transfers, this would be the recipient or sender
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  balanceBefore: { // User's balance (in 'currency') before this transaction was applied
    type: Number,
    required: true,
  },
  balanceAfter: { // User's balance (in 'currency') after this transaction was applied
    type: Number,
    required: true,
  },
  metadata: { // For any extra information, e.g., IP address, device info for fraud detection
    type: Schema.Types.Mixed,
  },
  notes: { // Internal notes for admin/support
    type: String,
  },
  processedAt: { // When the transaction status moved from pending to a final state
    type: Date,
  },
}, {
  timestamps: true, 
});

// Pre-save hook to set processedAt when status changes to a final state
transactionSchema.pre('save', function (next) {
  if (this.isModified('status') && ['completed', 'failed', 'cancelled', 'reversed'].includes(this.status) && !this.processedAt) {
    this.processedAt = new Date();
  }
  next();
});

// // Example of a static method (less common for transactions directly, more for services)
// // transactionSchema.statics.findRecentByUser = function (userId: Schema.Types.ObjectId, limit: number = 10) {
// //   return this.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).exec();
// // };

// // Compound index for common queries
// transactionSchema.index({ user: 1, status: 1, createdAt: -1 });
// transactionSchema.index({ type: 1, status: 1 });

export default model('Transaction', transactionSchema);