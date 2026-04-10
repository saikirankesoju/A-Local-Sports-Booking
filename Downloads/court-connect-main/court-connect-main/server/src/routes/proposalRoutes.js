import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { createProposal, listPendingProposals, listPublicVenues, reviewProposal } from '../controllers/proposalController.js';

const router = Router();

router.get('/', listPublicVenues);
router.post('/proposals', authenticate, authorizeRoles('owner'), createProposal);
router.get('/admin/pending', authenticate, authorizeRoles('admin'), listPendingProposals);
router.patch('/admin/:id/review', authenticate, authorizeRoles('admin'), reviewProposal);

export default router;
