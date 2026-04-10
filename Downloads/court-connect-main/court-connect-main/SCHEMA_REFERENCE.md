# Court Connect - Database Schema Visual Reference

## Collection Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         COURT CONNECT                            │
│                    Database Architecture                         │
└─────────────────────────────────────────────────────────────────┘

                          Sports (Master Data)
                                 │
                                 │ referenced by
                                 ▼
┌──────────────────────────────────────────────────────────────┐
│                      USERS (7 fields)                        │
│  ┌─ User (customer/player)                                   │
│  ├─ Owner (facility manager)                                 │
│  └─ Admin (platform manager)                                 │
└──────────────────────────────────────────────────────────────┘
         │                             │                    │
         │ ownerId                     │ approvedBy        │ userId
         │ (one-to-many)              │                   │
         ▼                             ▼                   ▼
    ┌─────────────────┐      ┌──────────────────┐    ┌──────────────┐
    │  VENUES         │      │  REVIEWS         │    │  BOOKINGS    │
    │ (Facilities)    │      │ (ratings & text) │    │ (Reservations)
    │                 │      │                  │    │              │
    │ ┌─ Embedded:    │      │ ┌─ Embedded:    │    │ ┌─ Embedded: │
    │ │  · Courts     │      │ │   userAvatar   │    │ │  · Pricing │
    │ │  · Amenities  │      │ │   userName     │    │ │  · Payment │
    │ │  · Sports     │      │ │                │    │ │  · Status  │
    │ └─ Denormalized:│      │ └─ Denormalized:│    │ │ · Participant
    │    owners name  │      │    venueName    │    │ │   Notes    │
    └─────────────────┘      └──────────────────┘    └──────────────┘
         │                         │                       │
         │ _id                     │ _id              courtId
         │                         │                       │
         ▼                         ▼                       ▼
    ┌──────────────────────────────────────────────────────────┐
    │            TIME SLOTS                                     │
    │  (Availability per court per day)                         │
    │                                                           │
    │  ┌─ One document per court per day                       │
    │  ├─ Array of hourly slots                               │
    │  ├─ Each slot: available, bookedBy, bookingId           │
    │  └─ TTL Index on expiresAt (auto-cleanup)              │
    └──────────────────────────────────────────────────────────┘
         │
         └─ References bookings via bookingId


    ┌──────────────────┐
    │  PAYMENTS        │
    │ (Transactions)   │
    │                  │
    └──────────────────┘
           │
           ├─ Linked to Bookings
           ├─ Payment history
           └─ Refund tracking
```

---

## Data Flow Examples

### 1. Venue Creation Flow

```
User (Owner) registers
        │
        ▼
Create Venue document
  ├─ Embed courts array
  ├─ Set approval.status = "pending"
  ├─ Store address + coordinates
  └─ Initialize stats: { totalBookings: 0, averageRating: 0 }
        │
        ▼
Admin views venues with approval.status = "pending"
        │
        ▼
Admin approves venue
  ├─ Update approval.status = "approved"
  ├─ Set approvedBy = admin._id
  └─ Venue becomes searchable
```

### 2. Booking Flow

```
User searches venues
        │
        ▼
Query timeSlots collection
  └─ Find: { courtId, date, "slots.available": true }
        │
        ▼
Display available times
        │
        ▼
User selects slot → Create Booking
  ├─ Create booking document
  ├─ Update timeSlot: available = false, bookedBy = userId
  ├─ Initialize paymentStatus = "pending"
  └─ Generate bookingNumber
        │
        ▼
Process Payment (Stripe/Razorpay)
  ├─ Create Payment document
  ├─ Update Booking: paymentStatus = "paid"
  └─ SendConfirmation email
        │
        ▼
Booking confirmed!
```

### 3. Review & Rating Flow

```
User completes booking (status = "completed")
        │
        ▼
User submits review + rating
        │
        ▼
Create Review document
  ├─ Store userId, venueId, rating, comment
  ├─ Set verified = true (booking verified)
  └─ Add to reviews collection
        │
        ▼
Update Venue stats (Aggregation or Hook)
  ├─ Calculate averageRating = avg of all reviews
  ├─ Increment totalReviews count
  └─ Update venue document
```

---

## Quick Reference: Collection Fields

### Users
```javascript
{
  email,                    // unique, indexed
  fullName,                 // required
  password,                 // hashed
  role,                     // enum: user|owner|admin
  avatar,                   // optional
  metadata: {
    isActive,              // boolean
    isBanned,              // boolean
    lastLogin              // date
  },
  timestamps                // createdAt, updatedAt
}
```

### Venues
```javascript
{
  name,                     // required
  ownerId,                  // references User
  address, city,            // required
  coordinates,              // geospatial: 2dsphere
  sports: [{ _id, name, icon }],        // embedded array
  courts: [{                            // embedded array
    name,
    sportType,
    pricePerHour,
    operatingHoursStart/End
  }],
  stats: {                  // denormalized: updated on booking/review
    totalBookings,
    totalReviews,
    averageRating,
    totalCourts
  },
  approval: {               // approval workflow
    status,                 // pending|approved|rejected
    approvedBy,             // admin _id
    approvedAt,
    rejectionReason
  },
  timestamps
}
```

### Bookings
```javascript
{
  bookingNumber,            // unique: "BC-2026-00123"
  userId,                   // references User
  venueId,                  // references Venue
  courtId,                  // ObjectId
  date, startTime, endTime, // required
  pricing: {                // embedded: subtotal, discount, tax, total
    pricePerHour,
    totalPrice
  },
  status,                   // confirmed|pending|cancelled|completed
  paymentStatus,            // pending|paid|failed|refunded
  transactionId,            // from payment gateway
  participants: [{          // embedded array
    name, email, phone
  }],
  cancellation: {           // refund tracking
    status,
    reason,
    cancelledAt,
    refundAmount
  },
  timestamps
}
```

### TimeSlots
```javascript
{
  venueId,                  // indexed
  courtId,                  // indexed
  date,                     // "2026-03-30", indexed
  slots: [{                 // array of hourly slots
    startTime,              // "06:00"
    endTime,                // "07:00"
    available,              // boolean
    bookedBy,               // userId if booked
    bookingId               // reference to Booking
  }],
  expiresAt,                // TTL: auto-delete old slots
  timestamps
}
```

### Reviews
```javascript
{
  userId,                   // references User
  venueId,                  // references Venue, indexed
  rating,                   // 1-5, indexed
  comment,                  // text review
  verified,                 // true if by verified buyer
  verifiedPurchase,         // booking-verified review
  helpful: {                // like count
    count,
    users: [userId]
  },
  images: [urls],           // optional photos
  timestamps
}
```

### Payments
```javascript
{
  transactionId,            // unique, from gateway
  bookingId,                // references Booking
  userId,                   // references User, indexed
  amount,                   // in INR (multiply by 100 for paise)
  currency,                 // "INR"
  paymentMethod,            // "credit_card", "upi", etc.
  paymentGateway,           // "Stripe", "Razorpay"
  status,                   // success|failed|pending
  gatewayResponse: {        // full response from payment gateway
    chargeId,
    status
  },
  refund: {
    status,
    amount,
    refundId
  },
  createdAt                 // when payment was processed
}
```

---

## Indexing Strategy

### Single Field Indexes
```javascript
{ email: 1 }              // Users - unique, authentication
{ role: 1 }               // Users - filter by permission level
{ ownerId: 1 }            // Venues - find owner's facilities
{ "approval.status": 1 }  // Venues - pending approvals
{ city: 1 }               // Venues - location filtering
{ rating: 1 }             // Reviews - sort by rating
```

### Compound Indexes
```javascript
{ userId: 1, date: -1 }           // Bookings - user's bookings timeline
{ date: 1, status: 1 }            // Bookings - find bookings by date/status
{ venueId: 1, createdAt: -1 }     // Reviews - venue reviews timeline
{ venueId: 1, courtId: 1, date: 1 }  // TimeSlots - unique constraint
{ bookingNumber: 1 }              // Bookings - fast lookup
```

### Geospatial Index
```javascript
{ coordinates: "2dsphere" }       // Venues - location-based searches
```

### TTL Index
```javascript
{ expiresAt: 1 }, { expireAfterSeconds: 0 }  // TimeSlots - auto-cleanup
```

---

## Query Examples

### Find all available slots for a court on a specific date
```javascript
db.timeSlots.findOne({
  courtId: ObjectId("..."),
  date: "2026-03-30"
})
// Returns slots array, filter for available: true
```

### Get user's upcoming bookings
```javascript
db.bookings
  .find({
    userId: ObjectId("user_id"),
    date: { $gte: "2026-03-15" },
    status: { $in: ["confirmed", "pending"] }
  })
  .sort({ date: 1 })
  .limit(10)
```

### Find venues near user (5 km)
```javascript
db.venues.find({
  coordinates: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [77.6245, 12.9352]  // [longitude, latitude]
      },
      $maxDistance: 5000  // meters
    }
  },
  "approval.status": "approved"
})
```

### Get venue with all reviews (with aggregation)
```javascript
db.venues.aggregate([
  { $match: { _id: ObjectId("venue_id") } },
  {
    $lookup: {
      from: "reviews",
      localField: "_id",
      foreignField: "venueId",
      as: "reviews"
    }
  },
  {
    $addFields: {
      reviewCount: { $size: "$reviews" },
      avgRating: { $avg: "$reviews.rating" }
    }
  }
])
```

### Get pending venue approvals (admin)
```javascript
db.venues
  .find({
    "approval.status": "pending"
  })
  .sort({ createdAt: 1 })
  .limit(20)
```

---

## Performance Tips

1. **Geospatial Search**: Always use 2dsphere index for location-based queries
2. **Pagination**: Always limit results and use skip/limit for pagination
3. **Projection**: Select only needed fields to reduce network payload
4. **Denormalization**: Store `venueName` in bookings to avoid lookup
5. **Aggregation Pipeline**: Use for complex transformations
6. **Indexing**: Create compound indexes for common query patterns
7. **Connection Pooling**: Set `maxPoolSize: 10` in production
8. **Caching**: Cache venue details with 1-hour TTL
9. **Batch Operations**: Use bulkWrite for multiple updates
10. **Monitor**: Use MongoDB Atlas Performance Advisor for slow queries

---

## Migration Checklist

- [ ] Create all collections with validation
- [ ] Create all indexes
- [ ] Migrate sports master data
- [ ] Migrate users with hashed passwords
- [ ] Migrate venues with embedded courts
- [ ] Migrate bookings and link to timeSlots
- [ ] Migrate reviews
- [ ] Verify indexes are being used (explain plan)
- [ ] Set up TTL indexes for timeSlots
- [ ] Test all query patterns from backend
- [ ] Enable backup and monitoring on Atlas
