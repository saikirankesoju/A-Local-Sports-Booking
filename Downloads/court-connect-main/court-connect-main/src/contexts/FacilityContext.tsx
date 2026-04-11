import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Venue } from '@/types';
import { venues as initialVenues } from '@/data/mockData';
import { isOwnedByUser } from '@/lib/utils';

interface FacilityContextType {
  venues: Venue[];
  updateVenue: (venueId: string, updates: Partial<Venue>) => void;
  addVenue: (venue: Venue) => void;
  approveFacility: (venueId: string) => void;
  rejectFacility: (venueId: string) => void;
  getOwnerVenues: (ownerId: string, ownerEmail?: string) => Venue[];
  getPendingVenues: () => Venue[];
  getApprovedVenues: () => Venue[];
}

const FacilityContext = createContext<FacilityContextType | undefined>(undefined);

export const FacilityProvider = ({ children }: { children: ReactNode }) => {
  const [venues, setVenues] = useState<Venue[]>(initialVenues);

  const updateVenue = (venueId: string, updates: Partial<Venue>) => {
    setVenues(prev =>
      prev.map(v => (v.id === venueId ? { ...v, ...updates } : v))
    );
  };

  const addVenue = (venue: Venue) => {
    setVenues(prev => [...prev, venue]);
  };

  const approveFacility = (venueId: string) => {
    updateVenue(venueId, { approved: true });
  };

  const rejectFacility = (venueId: string) => {
    updateVenue(venueId, { approved: false });
  };

  const getOwnerVenues = (ownerId: string, ownerEmail?: string) => {
    return venues.filter(v => v.ownerId === ownerId || v.ownerId === ownerEmail || isOwnedByUser(v.ownerId, { id: ownerId, email: ownerEmail }));
  };

  const getPendingVenues = () => {
    return venues.filter(v => !v.approved);
  };

  const getApprovedVenues = () => {
    return venues.filter(v => v.approved);
  };

  return (
    <FacilityContext.Provider
      value={{
        venues,
        updateVenue,
        addVenue,
        approveFacility,
        rejectFacility,
        getOwnerVenues,
        getPendingVenues,
        getApprovedVenues,
      }}
    >
      {children}
    </FacilityContext.Provider>
  );
};

export const useFacility = () => {
  const ctx = useContext(FacilityContext);
  if (!ctx) throw new Error('useFacility must be used within FacilityProvider');
  return ctx;
};
