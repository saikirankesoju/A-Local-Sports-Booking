export type UserRole = 'user' | 'owner' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  shortLocation: string;
  sports: Sport[];
  amenities: string[];
  photos: string[];
  rating: number;
  reviewCount: number;
  startingPrice: number;
  venueType: string;
  ownerId: string;
  approved: boolean;
  about: string;
}

export interface Court {
  id: string;
  venueId: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  operatingHoursStart: string;
  operatingHoursEnd: string;
}

export interface TimeSlot {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  blocked: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  userName?: string;
  venueId: string;
  venueName: string;
  courtId: string;
  courtName: string;
  sportType: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  venueId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
