import { Router } from 'express';
import authRoutes from './authRoutes.js';
import proposalRoutes from './proposalRoutes.js';
import bookingRoutes from './bookingRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/venues', proposalRoutes);
router.use('/bookings', bookingRoutes);

export default router;
