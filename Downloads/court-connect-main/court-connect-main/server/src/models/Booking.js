import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'VenueProposal', required: true },
    courtName: { type: String, required: true },
    courtId: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'refunded'], default: 'confirmed' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'paid' },
    cancellationReason: { type: String, default: '' },
    refundAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bookingSchema.index({ venueId: 1, courtId: 1, date: 1, startTime: 1 }, { unique: true });

export const Booking = mongoose.model('Booking', bookingSchema);
