import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TimeSlot } from '@/types';

interface TimeSlotsContextType {
  blockedSlots: Set<string>;
  bookedSlots: Set<string>;
  blockSlot: (slotId: string) => void;
  unblockSlot: (slotId: string) => void;
  bookSlot: (slotId: string) => void;
  unbookSlot: (slotId: string) => void;
  isSlotBlocked: (slotId: string) => boolean;
  isSlotBooked: (slotId: string) => boolean;
  clearSlotsForCourt: (courtId: string) => void;
}

const TimeSlotsContext = createContext<TimeSlotsContextType | undefined>(undefined);

export const TimeSlotsProvider = ({ children }: { children: ReactNode }) => {
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

  const blockSlot = (slotId: string) => {
    setBlockedSlots(prev => new Set(prev).add(slotId));
  };

  const unblockSlot = (slotId: string) => {
    setBlockedSlots(prev => {
      const newSet = new Set(prev);
      newSet.delete(slotId);
      return newSet;
    });
  };

  const bookSlot = (slotId: string) => {
    setBookedSlots(prev => new Set(prev).add(slotId));
  };

  const unbookSlot = (slotId: string) => {
    setBookedSlots(prev => {
      const newSet = new Set(prev);
      newSet.delete(slotId);
      return newSet;
    });
  };

  const isSlotBlocked = (slotId: string) => blockedSlots.has(slotId);

  const isSlotBooked = (slotId: string) => bookedSlots.has(slotId);

  const clearSlotsForCourt = (courtId: string) => {
    // Clear slots for a specific court when needed
    setBlockedSlots(prev => {
      const newSet = new Set(prev);
      Array.from(newSet).forEach(slotId => {
        if (slotId.includes(courtId)) {
          newSet.delete(slotId);
        }
      });
      return newSet;
    });
  };

  return (
    <TimeSlotsContext.Provider
      value={{
        blockedSlots,
        bookedSlots,
        blockSlot,
        unblockSlot,
        bookSlot,
        unbookSlot,
        isSlotBlocked,
        isSlotBooked,
        clearSlotsForCourt,
      }}
    >
      {children}
    </TimeSlotsContext.Provider>
  );
};

export const useTimeSlots = () => {
  const ctx = useContext(TimeSlotsContext);
  if (!ctx) throw new Error('useTimeSlots must be used within TimeSlotsProvider');
  return ctx;
};
