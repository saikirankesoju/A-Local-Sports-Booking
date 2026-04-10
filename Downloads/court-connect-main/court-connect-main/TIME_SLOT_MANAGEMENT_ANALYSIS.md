# Time Slot Management Analysis - Court Connect

## Executive Summary

This document provides a comprehensive analysis of how time slot management is implemented in the Court Connect application. The system currently uses **mock data with client-side state management** and is designed to be integrated with a MongoDB backend.

---

## 1. KEY FILES INVOLVED IN TIME SLOT MANAGEMENT

### 1.1 Type Definitions
**File:** `src/types/index.ts` (Lines 40-46)

```typescript
export interface TimeSlot {
  id: string;           // Unique identifier: ts-{courtId}-{date}-{hour}
  courtId: string;      // Reference to court
  date: string;         // YYYY-MM-DD format
  startTime: string;    // HH:00 format
  endTime: string;      // HH:00 format
  available: boolean;   // Is slot available for booking
  blocked: boolean;     // Is slot blocked by owner
}
```

### 1.2 Time Slot Generation (Mock Data)
**File:** `src/data/mockData.ts` (Lines 80-95)

```typescript
export const generateTimeSlots = (courtId: string, date: string): TimeSlot[] => {
  const court = courts.find(c => c.id === courtId);
  if (!court) return [];
  
  const startHour = parseInt(court.operatingHoursStart.split(':')[0]);
  const endHour = parseInt(court.operatingHoursEnd.split(':')[0]);
  
  const slots: TimeSlot[] = [];
  for (let h = startHour; h < endHour; h++) {
    const isBooked = Math.random() < 0.3; // 30% randomly booked
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
```

**Key Characteristics:**
- Generates 1-hour time slots dynamically
- Respects court operating hours (e.g., 6:00-22:00)
- Randomly marks ~30% as booked
- No persistence (regenerates on each call)

---

## 2. PAGES HANDLING TIME SLOTS

### 2.1 BookingPage (User Booking Flow)
**File:** `src/pages/BookingPage.tsx`
**Route:** `/book/:venueId`

**Three-Step Booking Process:**

| Step | Component | Logic |
|------|-----------|-------|
| 1 | Court Selection | Lists all courts for the venue |
| 2 | Date Selection | 7-day date picker (today + 6 days) |
| 3 | Time Slot Selection | Grid display of hourly slots |

**Key Code Sections:**

```typescript
// Fetch time slots for selected court and date
const timeSlots = selectedCourt && selectedDate 
  ? generateTimeSlots(selectedCourt, selectedDate) 
  : [];

// Display slots with availability indicator
{timeSlots.map(ts => (
  <button
    disabled={!ts.available}  // Disable unavailable slots
    onClick={() => setSelectedSlot(ts.id)}
    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
      !ts.available 
        ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50 border-muted' 
        : selectedSlot === ts.id 
          ? 'border-primary bg-primary text-primary-foreground' 
          : 'border-muted hover:border-primary/30'
    }`}
  >
    {ts.startTime}
  </button>
))}
```

**State Management:**
```typescript
const [selectedCourt, setSelectedCourt] = useState('');
const [selectedDate, setSelectedDate] = useState('');
const [selectedSlot, setSelectedSlot] = useState('');
const [confirmed, setConfirmed] = useState(false);
```

**Booking Creation:**
```typescript
const booking = {
  id: `b${Date.now()}`,
  userId: user.id,
  venueId: venue.id,
  courtId: court.id,
  date: selectedDate,
  startTime: slot.startTime,    // From TimeSlot
  endTime: slot.endTime,        // From TimeSlot
  totalPrice: court.pricePerHour,
  status: 'confirmed' as const,
  createdAt: new Date().toISOString().split('T')[0],
};

addBooking(booking);  // Added via DataContext
```

### 2.2 TimeSlotManagement (Owner Dashboard)
**File:** `src/pages/owner/TimeSlotManagement.tsx`
**Route:** `/owner/time-slots`

**Features:**
- Court selection dropdown (filtered by owner)
- Today's time slots grid display
- Block/Unblock buttons for time slots

**Current Implementation:**
```typescript
const ownerVenues = venues.filter(v => v.ownerId === user?.id);
const ownerCourts = courts.filter(c => ownerVenues.some(v => v.id === c.venueId));
const [selectedCourt, setSelectedCourt] = useState(ownerCourts[0]?.id || '');
const today = new Date().toISOString().split('T')[0];
const slots = selectedCourt ? generateTimeSlots(selectedCourt, today) : [];

// Block/Unblock handler (placeholder)
<Button
  variant="ghost" 
  size="sm" 
  className="mt-2 w-full text-xs"
  onClick={() => toast.info(slot.available ? 'Slot blocked' : 'Slot unblocked')}
>
  {slot.available ? <><Lock className="h-3 w-3 mr-1" /> Block</> : ...}
</Button>
```

**Issues:**
- ❌ Block/Unblock is not actually updating slot state
- ❌ Only shows today's slots (hardcoded)
- ❌ No persistence of blocked slots

---

## 3. STATE MANAGEMENT ARCHITECTURE

### 3.1 Context Hierarchy
```
App.tsx
├── QueryClientProvider
├── DataProvider
│   ├── users: User[]
│   ├── bookings: Booking[]
│   └── Methods: addBooking(), updateBooking(), deleteBooking()
├── AuthProvider
│   └── Current user & authentication
├── FacilityProvider
│   ├── venues: Venue[]
│   └── Methods: updateVenue(), approveFacility(), getApprovedVenues()
└── CourtsProvider
    ├── courts: Court[]
    └── Methods: getVenueCourts(), addCourt(), updateCourt()
```

### 3.2 DataContext (Booking Management)
**File:** `src/contexts/DataContext.tsx`

```typescript
interface DataContextType {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  deleteBooking: (bookingId: string) => void;
  getUserBookings: (userId: string) => Booking[];
  getVenueBookings: (venueId: string) => Booking[];
}
```

**Note:** No direct TimeSlot management in context. Slots are generated on-demand via `generateTimeSlots()`.

### 3.3 CourtsContext
**File:** `src/contexts/CourtsContext.tsx`

```typescript
interface CourtsContextType {
  courts: Court[];
  getVenueCourts: (venueId: string) => Court[];
  addCourt: (court: Court) => void;
  updateCourt: (courtId: string, updates: Partial<Court>) => void;
}
```

**Related Court Type:**
```typescript
export interface Court {
  id: string;
  venueId: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  operatingHoursStart: string;  // e.g., "06:00"
  operatingHoursEnd: string;    // e.g., "22:00"
}
```

---

## 4. DATA FLOW FOR TIME SLOTS

### 4.1 User Booking Flow
```
User navigates to /book/:venueId
        ↓
Load venue details & courts via FacilityContext & CourtsContext
        ↓
User selects court
        ↓
Call generateTimeSlots(courtId, selectedDate)
        ↓
Display available & booked slots
        ↓
User selects time slot
        ↓
handleConfirm() creates booking object
        ↓
addBooking(booking) adds to DataContext.bookings
        ↓
Display confirmation page
```

### 4.2 Owner Managing Slots
```
Owner navigates to /owner/time-slots
        ↓
Filter owned venues & courts
        ↓
Select court from dropdown
        ↓
Call generateTimeSlots(courtId, today)
        ↓
Display today's slots with Block/Unblock buttons
        ↓
Click Block/Unblock → shows toast (NOT IMPLEMENTED)
```

---

## 5. API ENDPOINTS (Planned Backend)

### 5.1 Time Slot Related Endpoints
```http
GET /api/venues/:id/availability
  → Get available time slots for a venue's courts
  
GET /api/courts/:id/slots?date=YYYY-MM-DD
  → Get time slots for a specific court and date
  
POST /api/time-slots/check
  → Check if slot is available before booking

PUT /api/time-slots/:slotId/block
  → Block a time slot (owner)
  
PUT /api/time-slots/:slotId/unblock
  → Unblock a time slot (owner)
```

### 5.2 Related Booking Endpoints
```http
POST /api/bookings
  → Create booking (reserves time slot)
  
GET /api/bookings/venue/:venueId
  → Get all bookings for venue (owner view)
  → Useful for seeing which slots are booked
```

---

## 6. DATABASE SCHEMA (Planned)

### 6.1 TimeSlots Collection
```javascript
{
  "_id": ObjectId,
  "venueId": ObjectId,
  "courtId": ObjectId,
  "date": "2026-03-30",
  "slots": [
    {
      "startTime": "06:00",
      "endTime": "07:00",
      "available": true,
      "bookedBy": null,
      "bookingId": null
    },
    {
      "startTime": "07:00",
      "endTime": "08:00",
      "available": false,
      "bookedBy": ObjectId("user_id"),
      "bookingId": ObjectId("booking_id")
    }
  ],
  "createdAt": ISODate("2026-03-30T00:00:00Z"),
  "expiresAt": ISODate("2026-04-07T00:00:00Z")  // TTL: 7 days
}
```

### 6.2 Indexes
```javascript
// Unique compound index
db.timeSlots.createIndex(
  { venueId: 1, courtId: 1, date: 1 }, 
  { unique: true }
);

// TTL index for auto-cleanup
db.timeSlots.createIndex(
  { expiresAt: 1 }, 
  { expireAfterSeconds: 0 }
);

// Query by date
db.timeSlots.createIndex({ date: 1 });
```

---

## 7. CONSOLE ERRORS & WARNINGS

### 7.1 ESLint Issues (npm run lint)

**Errors:**
```
1. src/components/ui/command.tsx:24:11
   → Empty interface: 'interface CommandDialogProps extends DialogProps {}'
   
2. src/components/ui/textarea.tsx:5:18
   → Empty interface definition
   
3. tailwind.config.ts:111:13
   → require() style import forbidden
```

**Warnings (11 total):**
- Fast refresh only exports components (multiple UI files)
- Each Provider exports both component and hook

### 7.2 Potential Runtime Issues
- ✅ No console errors during app load
- ⚠️ Mock data regenerates slots on each call (different availability)
- ⚠️ No persistence between page refreshes
- ⚠️ Time slot blocking not implemented

---

## 8. CURRENT IMPLEMENTATION STATUS

### ✅ Working Features
- Time slot display in booking flow
- Date picker (7-day view)
- Slot availability visualization (grayed out booked slots)
- Booking confirmation after slot selection
- Owner can view today's slots
- Responsive grid layout for slots

### ❌ Not Yet Implemented
- Backend API integration
- Persistent time slot storage
- Block/Unblock functionality in owner dashboard
- Real-time availability updates
- Multi-day slot management for owners
- Slot management interface (create/update/delete)
- Payment integration (planned for bookings)

### ⚠️ Known Limitations
1. **No Persistence**: TimeSlots regenerate with different availability each page load
2. **30% Random Booking**: Mock data randomly marks ~30% of slots as booked
3. **Mock Data Only**: No backend connection
4. **Single Date View**: Owners can only see today's slots
5. **No Duplicate Prevention**: Same user can "book" same slot multiple times in current state

---

## 9. INTEGRATION CHECKLIST FOR BACKEND

- [ ] Create timeSlots collection in MongoDB
- [ ] Implement GET `/api/courts/:id/slots` endpoint
- [ ] Implement POST `/api/bookings` with slot availability check
- [ ] Implement PUT `/api/time-slots/:slotId/block` (owner)
- [ ] Implement PUT `/api/time-slots/:slotId/unblock` (owner)
- [ ] Add TTL indexes for slot cleanup
- [ ] Implement real-time availability updates (WebSocket/polling)
- [ ] Add transaction support for concurrent bookings
- [ ] Add booking cancellation with slot release
- [ ] Implement time slot multi-date management UI

---

## 10. COMPONENT STRUCTURE

```
TimeSlot Management Hierarchy:
├── BookingPage
│   ├── CourtSelect (Step 1)
│   ├── DateSelect (Step 2)
│   │   └── 7-day date picker
│   ├── TimeSlotSelect (Step 3)
│   │   └── Grid of hourly slots
│   ├── BookingSummary (Sidebar)
│   │   └── Price calculation
│   └── Confirmation (Success screen)
│
└── TimeSlotManagement (Owner)
    ├── CourtSelect (Dropdown)
    │   └── Filtered by owner
    ├── SlotsGrid
    │   └── Today's slots only
    └── Block/Unblock buttons
        └── NOT IMPLEMENTED
```

---

## Summary

The Court Connect time slot system is **fully functional for user bookings** with a clean, intuitive 3-step process. However, it relies entirely on **client-side mock data** with no backend persistence. The owner time slot management UI exists but blocking functionality is not implemented. All pieces are designed and ready for backend integration.

**Priority for MVP:**
1. Create timeSlots collection & implement availability check
2. Integrate GET slots endpoint in BookingPage
3. Complete block/unblock functionality in owner dashboard
4. Add transaction handling for concurrent bookings
