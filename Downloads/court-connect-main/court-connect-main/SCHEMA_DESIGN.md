# Court Connect - MongoDB Schema Design

## Database Schema Overview

This document outlines the MongoDB schema design for the Court Connect sports venue booking platform.

---

## Collections

### 1. **Users Collection**

Stores all user information (players, facility owners, admins).

```json
{
  "_id": ObjectId,
  "email": "john@example.com",
  "fullName": "John Doe",
  "password": "hashed_password",
  "role": "user",
  "avatar": "https://url-to-avatar",
  "phone": "+91-9876543210",
  "address": "123 Main Street",
  "city": "Bangalore",
  "state": "Karnataka",
  "createdAt": ISODate("2026-03-01T10:00:00Z"),
  "updatedAt": ISODate("2026-03-01T10:00:00Z"),
  "metadata": {
    "lastLogin": ISODate("2026-03-08T15:30:00Z"),
    "isActive": true,
    "isBanned": false
  }
}
```

**Indexes:**
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ createdAt: -1 })
```

**Roles:**
- `user` - Regular player/customer
- `owner` - Facility owner/manager
- `admin` - Platform administrator

---

### 2. **Sports Collection**

Master data for supported sports types.

```json
{
  "_id": ObjectId,
  "name": "Badminton",
  "icon": "🏸",
  "description": "Badminton sport",
  "isActive": true,
  "createdAt": ISODate("2026-01-01T00:00:00Z")
}
```

**Indexes:**
```javascript
db.sports.createIndex({ name: 1 }, { unique: true })
```

---

### 3. **Venues Collection**

Sports facilities/venues. Stores facility information with embedded courts data (for better query performance on single venue access).

```json
{
  "_id": ObjectId,
  "name": "GreenField Sports Arena",
  "description": "A premier multi-sport facility",
  "ownerId": ObjectId("owner_user_id"),
  "ownerName": "Raj Kumar",
  "category": "Indoor",
  "address": "123 Sports Lane, Koramangala, Bangalore",
  "city": "Bangalore",
  "state": "Karnataka",
  "coordinates": {
    "type": "Point",
    "coordinates": [77.6245, 12.9352]
  },
  "contactNumber": "+91-9876543210",
  "email": "contact@greenfield.com",
  "sports": [
    { "_id": ObjectId("sport_id"), "name": "Badminton", "icon": "🏸" },
    { "_id": ObjectId("sport_id"), "name": "Tennis", "icon": "🎾" }
  ],
  "amenities": [
    "Parking",
    "Changing Room",
    "Drinking Water",
    "Floodlights",
    "First Aid"
  ],
  "priceRange": {
    "min": 400,
    "max": 700
  },
  "operatingHours": {
    "monday": { "open": "06:00", "close": "22:00" },
    "tuesday": { "open": "06:00", "close": "22:00" },
    "wednesday": { "open": "06:00", "close": "22:00" },
    "thursday": { "open": "06:00", "close": "22:00" },
    "friday": { "open": "06:00", "close": "22:00" },
    "saturday": { "open": "06:00", "close": "23:00" },
    "sunday": { "open": "06:00", "close": "23:00" }
  },
  "photos": ["url1", "url2", "url3"],
  "about": "GreenField Sports Arena is a world-class facility...",
  "stats": {
    "totalBookings": 342,
    "totalReviews": 128,
    "averageRating": 4.5,
    "totalCourts": 3
  },
  "approval": {
    "status": "approved",
    "approvedBy": ObjectId("admin_id"),
    "approvedAt": ISODate("2026-02-15T10:00:00Z"),
    "rejectionReason": null
  },
  "courts": [
    {
      "_id": ObjectId,
      "name": "Court A",
      "sportType": "Badminton",
      "pricePerHour": 500,
      "capacity": 4,
      "operatingHoursStart": "06:00",
      "operatingHoursEnd": "22:00",
      "amenities": ["AC", "Lighting", "Equipment"],
      "isActive": true
    }
  ],
  "createdAt": ISODate("2026-01-15T10:00:00Z"),
  "updatedAt": ISODate("2026-03-08T15:30:00Z")
}
```

**Indexes:**
```javascript
db.venues.createIndex({ ownerId: 1 })
db.venues.createIndex({ "approval.status": 1 })
db.venues.createIndex({ city: 1 })
db.venues.createIndex({ coordinates: "2dsphere" })
db.venues.createIndex({ createdAt: -1 })
db.venues.createIndex({ "stats.averageRating": -1 })
```

**Design Decision:**
- **Embedded courts**: Courts are embedded in venues because:
  - Courts are always accessed together with their venue
  - No independent access to courts needed
  - Reduces $lookup operations
  - Typical venue has 2-10 courts (no 16MB limit risk)

---

### 4. **TimeSlots Collection**

Available time slots for each court. Uses time-series bucket pattern for optimal storage and query performance.

```json
{
  "_id": ObjectId,
  "venueId": ObjectId("venue_id"),
  "courtId": ObjectId("court_id"),
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
  "expiresAt": ISODate("2026-04-07T00:00:00Z")
}
```

**Indexes:**
```javascript
db.timeSlots.createIndex({ venueId: 1, courtId: 1, date: 1 }, { unique: true })
db.timeSlots.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
db.timeSlots.createIndex({ date: 1 })
```

**Design Decision:**
- **Embedded array of slots**: Stores all slots for a day in one document for:
  - Single query to get all availability for a day
  - Easy update of multiple slot statuses
  - Better performance than individual documents per slot
- **TTL Index**: Auto-deletes old slots after expiration

---

### 5. **Bookings Collection**

User reservations for courts.

```json
{
  "_id": ObjectId,
  "bookingNumber": "BC-2026-00123",
  "userId": ObjectId("user_id"),
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "venueId": ObjectId("venue_id"),
  "venueName": "GreenField Sports Arena",
  "courtId": ObjectId("court_id"),
  "courtName": "Court A",
  "sportType": "Badminton",
  "date": "2026-03-30",
  "startTime": "10:00",
  "endTime": "11:00",
  "durationMinutes": 60,
  "pricing": {
    "pricePerHour": 500,
    "quantity": 1,
    "subtotal": 500,
    "discount": 0,
    "tax": 0,
    "totalPrice": 500
  },
  "status": "confirmed",
  "paymentStatus": "paid",
  "paymentMethod": "credit_card",
  "transactionId": "txn_12345",
  "participants": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91-9876543210"
    }
  ],
  "notes": "Team practice session",
  "cancellation": {
    "status": false,
    "reason": null,
    "cancelledAt": null,
    "refundAmount": null
  },
  "createdAt": ISODate("2026-03-28T10:00:00Z"),
  "updatedAt": ISODate("2026-03-28T10:30:00Z")
}
```

**Indexes:**
```javascript
db.bookings.createIndex({ userId: 1, date: -1 })
db.bookings.createIndex({ venueId: 1 })
db.bookings.createIndex({ date: 1, status: 1 })
db.bookings.createIndex({ bookingNumber: 1 }, { unique: true })
db.bookings.createIndex({ createdAt: -1 })
db.bookings.createIndex({ paymentStatus: 1 })
```

**Design Decision:**
- **Extended reference**: Embedded user and venue details to avoid $lookup on every booking query
- **Denormalization**: Storing `venueName`, `courtName` etc. for historical accuracy (bookings should reflect what was booked, even if names change)

---

### 6. **Reviews Collection**

User reviews and ratings for venues.

```json
{
  "_id": ObjectId,
  "userId": ObjectId("user_id"),
  "userName": "Jane Smith",
  "userAvatar": "avatar_url",
  "venueId": ObjectId("venue_id"),
  "rating": 5,
  "comment": "Amazing facility! Courts are well maintained...",
  "verified": true,
  "verifiedPurchase": true,
  "helpful": {
    "count": 12,
    "users": [ObjectId, ObjectId]
  },
  "images": ["url1", "url2"],
  "createdAt": ISODate("2026-03-15T10:00:00Z"),
  "updatedAt": ISODate("2026-03-15T10:00:00Z")
}
```

**Indexes:**
```javascript
db.reviews.createIndex({ venueId: 1, createdAt: -1 })
db.reviews.createIndex({ userId: 1 })
db.reviews.createIndex({ rating: 1 })
db.reviews.createIndex({ verified: 1 })
```

---

### 7. **Payments Collection** (Optional but recommended)

Payment transaction history.

```json
{
  "_id": ObjectId,
  "transactionId": "txn_12345",
  "bookingId": ObjectId("booking_id"),
  "userId": ObjectId("user_id"),
  "amount": 500,
  "currency": "INR",
  "paymentMethod": "credit_card",
  "paymentGateway": "Stripe",
  "status": "success",
  "gatewayResponse": {
    "chargeId": "ch_123456",
    "status": "succeeded"
  },
  "refund": {
    "status": false,
    "amount": null,
    "refundId": null
  },
  "createdAt": ISODate("2026-03-28T10:00:00Z")
}
```

**Indexes:**
```javascript
db.payments.createIndex({ transactionId: 1 }, { unique: true })
db.payments.createIndex({ bookingId: 1 })
db.payments.createIndex({ userId: 1 })
db.payments.createIndex({ createdAt: -1 })
```

---

## Schema Design Principles Applied

### 1. **Embed vs Reference**

| Relationship | Decision | Reason |
|---|---|---|
| Venue ↔ Courts | **Embed** | Always accessed together; few courts per venue; improves query performance |
| Booking ↔ User | **Reference + Denormalize** | User details stored in booking for historical accuracy and query performance |
| Venue ↔ Sports | **Embed** | Small array; always needed with venue; improves readability |
| TimeSlot ↔ Bookings | **Reference** | Multiple bookings may reference same slot; prevents duplication |

### 2. **Denormalization**

- Booking includes: `venueName`, `courtName`, `userName` for quick access without $lookup
- Venue stats are pre-calculated and updated on each booking/review
- Prevents need for expensive JOIN operations

### 3. **Performance Optimization**

- **Geospatial Index** on venues for location-based searches
- **Compound Indexes** for common query patterns
- **TTL Index** on timeSlots for auto-cleanup
- **Approximation Pattern** on venue stats (updated asynchronously)

### 4. **Data Integrity**

- Unique constraints on email, booking number, transaction ID
- Status enums to prevent invalid values
- Timestamps on all documents for audit trail

---

## Query Patterns

### Find all bookings for a user
```javascript
db.bookings.find({ userId: ObjectId(...), date: { $gte: "2026-03-01" } })
  .sort({ date: -1 })
```

### Find available slots for a court on a specific date
```javascript
db.timeSlots.findOne({ 
  courtId: ObjectId(...), 
  date: "2026-03-30" 
})
```

### Search venues by location and sport
```javascript
db.venues.find({
  coordinates: { $near: { $geometry: { type: "Point", coordinates: [long, lat] }, $maxDistance: 5000 } },
  "sports.name": "Badminton"
})
```

### Get venue with all reviews
```javascript
db.venues.aggregate([
  { $match: { _id: ObjectId(...) } },
  { $lookup: { from: "reviews", localField: "_id", foreignField: "venueId", as: "reviews" } }
])
```

---

## Scaling Considerations

### Archive Pattern
- Move bookings older than 1 year to archive collection
- Keep hot data in main bookings collection

### Time-Series Data
- TimeSlots for past dates can be archived
- TTL indexes handle automatic cleanup

### Read Replicas
- Heavy read load on venue listings and reviews
- Use read preference for analytics queries

---

## Data Validation

Schema validation should be enforced at database level:

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "fullName", "role"],
      properties: {
        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
        fullName: { bsonType: "string", minLength: 2 },
        role: { enum: ["user", "owner", "admin"] },
        phone: { bsonType: "string", pattern: "^[0-9\\-+]{10,}$" }
      }
    }
  }
})
```

---

## Indexes Summary

| Collection | Index | Type | Purpose |
|---|---|---|---|
| users | email | Unique | Authentication |
| users | role | Regular | Filter by role |
| venues | ownerId | Regular | Find owner's venues |
| venues | coordinates | Geospatial | Location search |
| venues | approval.status | Regular | Find pending approvals |
| bookings | userId + date | Compound | User's bookings |
| bookings | venueId | Regular | Venue bookings |
| reviews | venueId + createdAt | Compound | Venue reviews timeline |
| timeSlots | venueId + courtId + date | Compound | Find slot availability |
| timeSlots | expiresAt | TTL | Auto-cleanup |

---

## Migration Path (From Current Structure)

Current: TypeScript interfaces with mock data
Target: MongoDB collections

1. **Phase 1**: Create base collections (Users, Sports, Venues)
2. **Phase 2**: Add booking system (Bookings, TimeSlots)
3. **Phase 3**: Add review system (Reviews)
4. **Phase 4**: Add payments (Payments)
5. **Phase 5**: Archive and optimization

---

## Notes

- All `_id` fields use MongoDB ObjectId by default
- All timestamps use ISO 8601 format
- Sensitive data (passwords) should be hashed using bcrypt
- Consider sharding on `userId` or `venueId` for horizontal scaling at scale
