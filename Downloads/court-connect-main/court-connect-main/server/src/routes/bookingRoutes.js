import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { cancelBooking, createBooking, getAvailability, listMyBookings } from '../controllers/bookingController.js';

const router = Router();

router.get('/availability', getAvailability);
router.post('/', authenticate, authorizeRoles('user'), createBooking);
router.get('/mine', authenticate, authorizeRoles('user'), listMyBookings);
router.patch('/:id/cancel', authenticate, authorizeRoles('user'), cancelBooking);

export default router;
