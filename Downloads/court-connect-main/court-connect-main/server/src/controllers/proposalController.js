import { VenueProposal } from '../models/VenueProposal.js';

export async function createProposal(req, res, next) {
  try {
    const proposal = await VenueProposal.create({
      ...req.body,
      ownerId: req.user.sub,
      ownerName: req.user.email,
      approvalStatus: 'pending',
    });

    res.status(201).json({ proposal });
  } catch (err) {
    next(err);
  }
}

export async function listPublicVenues(req, res, next) {
  try {
    const venues = await VenueProposal.find({ approvalStatus: 'approved' }).sort({ createdAt: -1 });
    res.json({ venues });
  } catch (err) {
    next(err);
  }
}

export async function listPendingProposals(req, res, next) {
  try {
    const proposals = await VenueProposal.find({ approvalStatus: 'pending' }).sort({ createdAt: -1 });
    res.json({ proposals });
  } catch (err) {
    next(err);
  }
}

export async function reviewProposal(req, res, next) {
  try {
    const { status, approvalNotes = '' } = req.body;
    const proposal = await VenueProposal.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: status,
        approvalNotes,
        approvedBy: req.user.sub,
        approvedAt: status === 'approved' ? new Date() : null,
      },
      { new: true }
    );

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    res.json({ proposal });
  } catch (err) {
    next(err);
  }
}
