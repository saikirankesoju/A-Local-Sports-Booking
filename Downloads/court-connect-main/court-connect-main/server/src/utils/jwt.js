import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { AuthSession } from '../models/AuthSession.js';

export function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function resolveClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || '';
}

export async function signAuthToken(user, req) {
  const jti = crypto.randomUUID();
  const payload = {
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
    jti,
  };

  const token = signToken(payload);
  const decoded = jwt.decode(token);
  const exp = typeof decoded === 'object' ? decoded?.exp : null;
  const expiresAt = typeof exp === 'number' ? new Date(exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await AuthSession.create({
    userId: user._id,
    jti,
    tokenHash: hashToken(token),
    userAgent: req.get('user-agent') || '',
    ipAddress: resolveClientIp(req),
    expiresAt,
  });

  return token;
}

export async function validateAccessToken(token) {
  const payload = verifyToken(token);

  if (!payload?.jti) {
    throw new Error('Token missing jti');
  }

  const session = await AuthSession.findOne({
    jti: payload.jti,
    tokenHash: hashToken(token),
    revokedAt: null,
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    session.revokedAt = new Date();
    await session.save();
    throw new Error('Session expired');
  }

  session.lastUsedAt = new Date();
  await session.save();

  return payload;
}

export async function revokeAccessToken(token) {
  const decoded = jwt.decode(token);
  const payload = typeof decoded === 'object' ? decoded : null;
  const jti = payload?.jti;

  if (!jti) {
    return;
  }

  await AuthSession.updateMany(
    { jti, tokenHash: hashToken(token), revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}
