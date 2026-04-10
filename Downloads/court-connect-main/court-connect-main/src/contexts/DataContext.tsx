import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Booking, User } from '@/types';
import { bookings as initialBookings, allUsers as initialUsers } from '@/data/mockData';

interface DataContextType {
  users: User[];
  bookings: Booking[];
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  deleteBooking: (bookingId: string) => void;
  getUserBookings: (userId: string) => Booking[];
  getVenueBookings: (venueId: string) => Booking[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...updates } : u))
    );
  };

  const addBooking = (booking: Booking) => {
    setBookings(prev => [...prev, booking]);
  };

  const updateBooking = (bookingId: string, updates: Partial<Booking>) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, ...updates } : b))
    );
  };

  const deleteBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  const getUserBookings = (userId: string) => {
    return bookings.filter(b => b.userId === userId);
  };

  const getVenueBookings = (venueId: string) => {
    return bookings.filter(b => b.venueId === venueId);
  };

  return (
    <DataContext.Provider
      value={{
        users,
        bookings,
        addUser,
        updateUser,
        addBooking,
        updateBooking,
        deleteBooking,
        getUserBookings,
        getVenueBookings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
