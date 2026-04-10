import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    available: { type: Boolean, default: true },
    priceOverride: { type: Number, default: 0 },
  },
  { _id: false }
);

const courtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sportType: { type: String, required: true },
    pricePerHour: { type: Number, required: true },
    operatingHoursStart: { type: String, required: true },
    operatingHoursEnd: { type: String, required: true },
    slots: { type: [slotSchema], default: [] },
  },
  { _id: false }
);

const venueProposalSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerName: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    location: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    sports: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    operatingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
    },
    courts: { type: [courtSchema], default: [] },
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvalNotes: { type: String, default: '' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

venueProposalSchema.index({ approvalStatus: 1, createdAt: -1 });

export const VenueProposal = mongoose.model('VenueProposal', venueProposalSchema);
