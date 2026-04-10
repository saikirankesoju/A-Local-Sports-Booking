import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Court } from '@/types';
import { courts as initialCourts } from '@/data/mockData';

interface CourtsContextType {
  courts: Court[];
  addCourt: (court: Court) => void;
  updateCourt: (courtId: string, updates: Partial<Court>) => void;
  deleteCourt: (courtId: string) => void;
  getVenueCourts: (venueId: string) => Court[];
}

const CourtsContext = createContext<CourtsContextType | undefined>(undefined);

export const CourtsProvider = ({ children }: { children: ReactNode }) => {
  const [courts, setCourts] = useState<Court[]>(initialCourts);

  const addCourt = (court: Court) => {
    setCourts(prev => [...prev, court]);
  };

  const updateCourt = (courtId: string, updates: Partial<Court>) => {
    setCourts(prev =>
      prev.map(c => (c.id === courtId ? { ...c, ...updates } : c))
    );
  };

  const deleteCourt = (courtId: string) => {
    setCourts(prev => prev.filter(c => c.id !== courtId));
  };

  const getVenueCourts = (venueId: string) => {
    return courts.filter(c => c.venueId === venueId);
  };

  return (
    <CourtsContext.Provider
      value={{
        courts,
        addCourt,
        updateCourt,
        deleteCourt,
        getVenueCourts,
      }}
    >
      {children}
    </CourtsContext.Provider>
  );
};

export const useCourts = () => {
  const ctx = useContext(CourtsContext);
  if (!ctx) throw new Error('useCourts must be used within CourtsProvider');
  return ctx;
};
