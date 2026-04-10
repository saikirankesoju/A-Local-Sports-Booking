import mongoose from 'mongoose';

const authSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jti: { type: String, required: true, unique: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    userAgent: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    lastUsedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

authSessionSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });

export const AuthSession = mongoose.model('AuthSession', authSessionSchema);
