import { Venue, Court, Booking, Review, Sport, TimeSlot, User } from '@/types';

export const currentUser: User = {
  id: 'o1',
  email: 'owner1@example.com',
  fullName: 'Raj Kumar',
  avatar: '',
  role: 'owner',
  password: 'Owner@1234',
};

export const sports: Sport[] = [
  { id: 's1', name: 'Badminton', icon: '🏸' },
  { id: 's2', name: 'Football', icon: '⚽' },
  { id: 's3', name: 'Tennis', icon: '🎾' },
  { id: 's4', name: 'Basketball', icon: '🏀' },
  { id: 's5', name: 'Cricket', icon: '🏏' },
  { id: 's6', name: 'Table Tennis', icon: '🏓' },
];

export const venues: Venue[] = [
  {
    id: 'v1', name: 'GreenField Sports Arena', description: 'A premier multi-sport facility with state-of-the-art courts and amenities.', address: '123 Sports Lane, Koramangala, Bangalore', shortLocation: 'Koramangala, Bangalore', sports: [sports[0], sports[2]], amenities: ['Parking', 'Changing Room', 'Drinking Water', 'Floodlights', 'First Aid'], photos: [], rating: 4.5, reviewCount: 128, startingPrice: 500, venueType: 'Indoor', ownerId: 'o1', approved: true, about: 'GreenField Sports Arena is a world-class facility located in the heart of Koramangala. With premium synthetic courts, professional-grade lighting, and top-notch amenities, we provide the ultimate sports experience.',
  },
  {
    id: 'v2', name: 'PowerPlay Turf', description: 'Premium turf ground for football and cricket with night play support.', address: '45 Stadium Road, Indiranagar, Bangalore', shortLocation: 'Indiranagar, Bangalore', sports: [sports[1], sports[4]], amenities: ['Parking', 'Cafeteria', 'Floodlights', 'Washrooms', 'Equipment Rental'], photos: [], rating: 4.2, reviewCount: 89, startingPrice: 800, venueType: 'Outdoor', ownerId: 'o1', approved: true, about: 'PowerPlay Turf offers premium artificial turf grounds perfect for football and cricket matches.',
  },
  {
    id: 'v3', name: 'SmashPoint Badminton Hub', description: 'Dedicated badminton facility with 8 professional courts.', address: '78 Court Avenue, HSR Layout, Bangalore', shortLocation: 'HSR Layout, Bangalore', sports: [sports[0]], amenities: ['Parking', 'Pro Shop', 'Coaching', 'Changing Room', 'Air Conditioned'], photos: [], rating: 4.8, reviewCount: 256, startingPrice: 400, venueType: 'Indoor', ownerId: 'o2', approved: true, about: 'SmashPoint is Bangalore\'s top-rated badminton hub with Olympic-standard wooden courts.',
  },
  {
    id: 'v4', name: 'Urban Sports Complex', description: 'Multi-purpose sports complex for basketball, tennis, and more.', address: '99 Complex Road, Whitefield, Bangalore', shortLocation: 'Whitefield, Bangalore', sports: [sports[2], sports[3]], amenities: ['Parking', 'Gym', 'Swimming Pool', 'Cafeteria', 'Lockers'], photos: [], rating: 4.0, reviewCount: 67, startingPrice: 600, venueType: 'Mixed', ownerId: 'o2', approved: true, about: 'Urban Sports Complex is a sprawling multi-sport facility.',
  },
  {
    id: 'v5', name: 'NetZone Table Tennis Club', description: 'Professional table tennis club with training facilities.', address: '12 Ping Road, JP Nagar, Bangalore', shortLocation: 'JP Nagar, Bangalore', sports: [sports[5]], amenities: ['Air Conditioned', 'Coaching', 'Equipment Provided', 'Parking'], photos: [], rating: 4.6, reviewCount: 45, startingPrice: 300, venueType: 'Indoor', ownerId: 'o3', approved: true, about: 'NetZone is a dedicated table tennis facility.',
  },
  {
    id: 'v6', name: 'Champions Cricket Ground', description: 'Full-size cricket ground with practice nets.', address: '200 Cricket Lane, Electronic City, Bangalore', shortLocation: 'Electronic City, Bangalore', sports: [sports[4]], amenities: ['Parking', 'Practice Nets', 'Floodlights', 'Washrooms', 'Pavilion'], photos: [], rating: 3.9, reviewCount: 34, startingPrice: 1200, venueType: 'Outdoor', ownerId: 'o3', approved: false, about: 'Champions Cricket Ground is a professional-grade cricket facility.',
  },
];

export const courts: Court[] = [
  { id: 'c1', venueId: 'v1', name: 'Court A', sportType: 'Badminton', pricePerHour: 500, operatingHoursStart: '06:00', operatingHoursEnd: '22:00' },
  { id: 'c2', venueId: 'v1', name: 'Court B', sportType: 'Badminton', pricePerHour: 500, operatingHoursStart: '06:00', operatingHoursEnd: '22:00' },
  { id: 'c3', venueId: 'v1', name: 'Tennis Court 1', sportType: 'Tennis', pricePerHour: 700, operatingHoursStart: '06:00', operatingHoursEnd: '22:00' },
  { id: 'c4', venueId: 'v2', name: 'Main Turf', sportType: 'Football', pricePerHour: 1500, operatingHoursStart: '06:00', operatingHoursEnd: '23:00' },
  { id: 'c5', venueId: 'v2', name: 'Practice Turf', sportType: 'Football', pricePerHour: 800, operatingHoursStart: '06:00', operatingHoursEnd: '23:00' },
  { id: 'c6', venueId: 'v3', name: 'Court 1', sportType: 'Badminton', pricePerHour: 400, operatingHoursStart: '06:00', operatingHoursEnd: '22:00' },
  { id: 'c7', venueId: 'v3', name: 'Court 2', sportType: 'Badminton', pricePerHour: 400, operatingHoursStart: '06:00', operatingHoursEnd: '22:00' },
  { id: 'c8', venueId: 'v3', name: 'Court 3', sportType: 'Badminton', pricePerHour: 450, operatingHoursStart: '06:00', operatingHoursEnd: '22:00' },
];

export const generateTimeSlots = (courtId: string, date: string): TimeSlot[] => {
  const court = courts.find(c => c.id === courtId);
  if (!court) return [];
  const startHour = parseInt(court.operatingHoursStart.split(':')[0]);
  const endHour = parseInt(court.operatingHoursEnd.split(':')[0]);
  const slots: TimeSlot[] = [];
  for (let h = startHour; h < endHour; h++) {
    const isBooked = Math.random() < 0.3;
    slots.push({
      id: `ts-${courtId}-${date}-${h}`,
      courtId,
      date,
      startTime: `${h.toString().padStart(2, '0')}:00`,
      endTime: `${(h + 1).toString().padStart(2, '0')}:00`,
      available: !isBooked,
      blocked: false,
    });
  }
  return slots;
};

export const bookings: Booking[] = [
  { id: 'b1', userId: 'u1', userName: 'John Doe', venueId: 'v1', venueName: 'GreenField Sports Arena', courtId: 'c1', courtName: 'Court A', sportType: 'Badminton', date: '2026-03-30', startTime: '10:00', endTime: '11:00', totalPrice: 500, status: 'confirmed', createdAt: '2026-03-28' },
  { id: 'b2', userId: 'u1', userName: 'John Doe', venueId: 'v3', venueName: 'SmashPoint Badminton Hub', courtId: 'c6', courtName: 'Court 1', sportType: 'Badminton', date: '2026-03-25', startTime: '18:00', endTime: '19:00', totalPrice: 400, status: 'completed', createdAt: '2026-03-20' },
  { id: 'b3', userId: 'u1', userName: 'John Doe', venueId: 'v2', venueName: 'PowerPlay Turf', courtId: 'c4', courtName: 'Main Turf', sportType: 'Football', date: '2026-03-22', startTime: '19:00', endTime: '20:00', totalPrice: 1500, status: 'cancelled', createdAt: '2026-03-18' },
  { id: 'b4', userId: 'u2', userName: 'Jane Smith', venueId: 'v1', venueName: 'GreenField Sports Arena', courtId: 'c2', courtName: 'Court B', sportType: 'Badminton', date: '2026-03-29', startTime: '14:00', endTime: '15:00', totalPrice: 500, status: 'confirmed', createdAt: '2026-03-27' },
  { id: 'b5', userId: 'u3', userName: 'Mike Johnson', venueId: 'v2', venueName: 'PowerPlay Turf', courtId: 'c5', courtName: 'Practice Turf', sportType: 'Football', date: '2026-03-31', startTime: '16:00', endTime: '17:00', totalPrice: 800, status: 'confirmed', createdAt: '2026-03-28' },
];

export const reviews: Review[] = [
  { id: 'r1', userId: 'u2', userName: 'Jane Smith', venueId: 'v1', rating: 5, comment: 'Amazing facility! Courts are well maintained and the staff is very friendly.', createdAt: '2026-03-15' },
  { id: 'r2', userId: 'u3', userName: 'Mike Johnson', venueId: 'v1', rating: 4, comment: 'Great courts but parking can be a challenge during peak hours.', createdAt: '2026-03-10' },
  { id: 'r3', userId: 'u1', userName: 'John Doe', venueId: 'v3', rating: 5, comment: 'Best badminton courts in Bangalore. Wooden flooring is a huge plus!', createdAt: '2026-03-08' },
];

export const allUsers: User[] = [
  { id: 'adm1', email: 'sai@gmail.com', fullName: 'Sai', role: 'admin', password: 'sai@123' },
  { id: 'o1', email: 'owner1@example.com', fullName: 'Raj Kumar', role: 'owner', password: 'Owner@1234' },
  { id: 'o2', email: 'owner2@example.com', fullName: 'Priya Sharma', role: 'owner', password: 'Owner@1234' },
  { id: 'o3', email: 'owner3@example.com', fullName: 'Arjun Singh', role: 'owner', password: 'Owner@1234' },
];
