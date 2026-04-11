import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { VenueProposal } from '../models/VenueProposal.js';
import { generateCourtSlots } from '../services/slotService.js';

export async function getAvailability(req, res, next) {
  try {
    const { venueId, courtId, date } = req.query;
    if (!venueId || !courtId || !date) {
      return res.status(400).json({ message: 'venueId, courtId, and date are required' });
    }

    const venue = await VenueProposal.findById(venueId);
    if (!venue || venue.approvalStatus !== 'approved') {
      return res.status(404).json({ message: 'Approved venue not found' });
    }

    const court = venue.courts.find(item => item.name === courtId || item._id?.toString() === courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    const baseSlots = generateCourtSlots(court, date);
    const bookings = await Booking.find({ venueId, courtId, date, status: { $ne: 'cancelled' } });

    const occupied = new Set(bookings.map(booking => booking.startTime));
    const slots = baseSlots.map(slot => ({
      ...slot,
      available: Boolean(slot.available) && !occupied.has(slot.startTime),
    }));

    res.json({ slots });
  } catch (err) {
    next(err);
  }
}

export async function createBooking(req, res, next) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { venueId, courtId, courtName, date, startTime, endTime, amount } = req.body;

    const venue = await VenueProposal.findById(venueId).session(session);
    if (!venue || venue.approvalStatus !== 'approved') {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Venue not available for booking' });
    }

    const court = venue.courts.find(item => item.name === courtId || item._id?.toString() === courtId);
    if (!court) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Court not found' });
    }

    const configuredSlots = generateCourtSlots(court, date);
    const requestedSlot = configuredSlots.find(
      slot => slot.startTime === startTime && slot.endTime === endTime
    );

    if (!requestedSlot) {
      await session.abortTransaction();
      return res.status(400).json({
        message: 'Requested time is outside facility owner configured slots',
      });
    }

    if (!requestedSlot.available) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Requested slot is blocked by facility owner' });
    }

    const existing = await Booking.findOne({ venueId, courtId, date, startTime }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res.status(409).json({ message: 'Slot already booked' });
    }

    const booking = await Booking.create([
      {
        userId: req.user.sub,
        venueId,
        courtId,
        courtName,
        date,
        startTime,
        endTime,
        amount,
        status: 'confirmed',
        paymentStatus: 'paid',
      },
    ], { session });

    await session.commitTransaction();
    res.status(201).json({ booking: booking[0] });
  } catch (err) {
    await session.abortTransaction();
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Slot already booked' });
    }
    next(err);
  } finally {
    session.endSession();
  }
}

export async function listMyBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ userId: req.user.sub }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.sub },
      { status: 'cancelled', cancellationReason: req.body.reason || 'Cancelled by user', paymentStatus: 'refunded', refundAmount: req.body.refundAmount || 0 },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
}
