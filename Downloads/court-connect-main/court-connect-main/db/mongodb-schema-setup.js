// MongoDB Schema Setup Scripts for Court Connect

// ============================================
// 1. CREATE USERS COLLECTION
// ============================================

db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "fullName", "password", "role"],
      properties: {
        _id: { bsonType: "objectId" },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "User email (unique)"
        },
        fullName: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
          description: "Full name of user"
        },
        password: {
          bsonType: "string",
          description: "Hashed password (bcrypt)"
        },
        role: {
          enum: ["user", "owner", "admin"],
          description: "User role"
        },
        avatar: { bsonType: "string" },
        phone: { bsonType: "string" },
        address: { bsonType: "string" },
        city: { bsonType: "string" },
        state: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        metadata: {
          bsonType: "object",
          properties: {
            lastLogin: { bsonType: "date" },
            isActive: { bsonType: "bool" },
            isBanned: { bsonType: "bool" }
          }
        }
      }
    }
  }
});

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: -1 });

// ============================================
// 2. CREATE SPORTS COLLECTION
// ============================================

db.createCollection("sports", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "icon"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        icon: { bsonType: "string" },
        description: { bsonType: "string" },
        isActive: { bsonType: "bool" }
      }
    }
  }
});

db.sports.createIndex({ name: 1 }, { unique: true });

// ============================================
// 3. CREATE VENUES COLLECTION
// ============================================

db.createCollection("venues", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "ownerId", "address", "city"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        description: { bsonType: "string" },
        ownerId: { bsonType: "objectId" },
        ownerName: { bsonType: "string" },
        category: { enum: ["Indoor", "Outdoor", "Mixed"] },
        address: { bsonType: "string" },
        city: { bsonType: "string" },
        state: { bsonType: "string" },
        coordinates: {
          bsonType: "object",
          properties: {
            type: { enum: ["Point"] },
            coordinates: { bsonType: "array" }
          }
        },
        contactNumber: { bsonType: "string" },
        email: { bsonType: "string" },
        sports: { bsonType: "array" },
        amenities: { bsonType: "array" },
        priceRange: {
          bsonType: "object",
          properties: {
            min: { bsonType: "int" },
            max: { bsonType: "int" }
          }
        },
        operatingHours: { bsonType: "object" },
        photos: { bsonType: "array" },
        about: { bsonType: "string" },
        stats: {
          bsonType: "object",
          properties: {
            totalBookings: { bsonType: "int" },
            totalReviews: { bsonType: "int" },
            averageRating: { bsonType: "double" },
            totalCourts: { bsonType: "int" }
          }
        },
        approval: {
          bsonType: "object",
          properties: {
            status: { enum: ["pending", "approved", "rejected"] },
            approvedBy: { bsonType: "objectId" },
            approvedAt: { bsonType: "date" },
            rejectionReason: { bsonType: "string" }
          }
        },
        courts: { bsonType: "array" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.venues.createIndex({ ownerId: 1 });
db.venues.createIndex({ "approval.status": 1 });
db.venues.createIndex({ city: 1 });
db.venues.createIndex({ coordinates: "2dsphere" });
db.venues.createIndex({ createdAt: -1 });
db.venues.createIndex({ "stats.averageRating": -1 });

// ============================================
// 4. CREATE TIMESLOTS COLLECTION
// ============================================

db.createCollection("timeSlots", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["venueId", "courtId", "date", "slots"],
      properties: {
        _id: { bsonType: "objectId" },
        venueId: { bsonType: "objectId" },
        courtId: { bsonType: "objectId" },
        date: { bsonType: "string" },
        slots: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              startTime: { bsonType: "string" },
              endTime: { bsonType: "string" },
              available: { bsonType: "bool" },
              bookedBy: { bsonType: "objectId" },
              bookingId: { bsonType: "objectId" }
            }
          }
        },
        createdAt: { bsonType: "date" },
        expiresAt: { bsonType: "date" }
      }
    }
  }
});

db.timeSlots.createIndex({ venueId: 1, courtId: 1, date: 1 }, { unique: true });
db.timeSlots.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.timeSlots.createIndex({ date: 1 });

// ============================================
// 5. CREATE BOOKINGS COLLECTION
// ============================================

db.createCollection("bookings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "venueId", "courtId", "date", "startTime", "endTime"],
      properties: {
        _id: { bsonType: "objectId" },
        bookingNumber: { bsonType: "string" },
        userId: { bsonType: "objectId" },
        userName: { bsonType: "string" },
        userEmail: { bsonType: "string" },
        venueId: { bsonType: "objectId" },
        venueName: { bsonType: "string" },
        courtId: { bsonType: "objectId" },
        courtName: { bsonType: "string" },
        sportType: { bsonType: "string" },
        date: { bsonType: "string" },
        startTime: { bsonType: "string" },
        endTime: { bsonType: "string" },
        durationMinutes: { bsonType: "int" },
        pricing: {
          bsonType: "object",
          properties: {
            pricePerHour: { bsonType: "double" },
            quantity: { bsonType: "int" },
            subtotal: { bsonType: "double" },
            discount: { bsonType: "double" },
            tax: { bsonType: "double" },
            totalPrice: { bsonType: "double" }
          }
        },
        status: { enum: ["confirmed", "pending", "cancelled", "completed"] },
        paymentStatus: { enum: ["pending", "paid", "failed", "refunded"] },
        paymentMethod: { bsonType: "string" },
        transactionId: { bsonType: "string" },
        participants: { bsonType: "array" },
        notes: { bsonType: "string" },
        cancellation: {
          bsonType: "object",
          properties: {
            status: { bsonType: "bool" },
            reason: { bsonType: "string" },
            cancelledAt: { bsonType: "date" },
            refundAmount: { bsonType: "double" }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.bookings.createIndex({ userId: 1, date: -1 });
db.bookings.createIndex({ venueId: 1 });
db.bookings.createIndex({ date: 1, status: 1 });
db.bookings.createIndex({ bookingNumber: 1 }, { unique: true });
db.bookings.createIndex({ createdAt: -1 });
db.bookings.createIndex({ paymentStatus: 1 });

// ============================================
// 6. CREATE REVIEWS COLLECTION
// ============================================

db.createCollection("reviews", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "venueId", "rating"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        userName: { bsonType: "string" },
        userAvatar: { bsonType: "string" },
        venueId: { bsonType: "objectId" },
        rating: { bsonType: "int", minimum: 1, maximum: 5 },
        comment: { bsonType: "string" },
        verified: { bsonType: "bool" },
        verifiedPurchase: { bsonType: "bool" },
        helpful: {
          bsonType: "object",
          properties: {
            count: { bsonType: "int" },
            users: { bsonType: "array" }
          }
        },
        images: { bsonType: "array" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.reviews.createIndex({ venueId: 1, createdAt: -1 });
db.reviews.createIndex({ userId: 1 });
db.reviews.createIndex({ rating: 1 });
db.reviews.createIndex({ verified: 1 });

// ============================================
// 7. CREATE PAYMENTS COLLECTION
// ============================================

db.createCollection("payments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["transactionId", "bookingId", "userId", "amount", "currency"],
      properties: {
        _id: { bsonType: "objectId" },
        transactionId: { bsonType: "string" },
        bookingId: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        amount: { bsonType: "double" },
        currency: { bsonType: "string" },
        paymentMethod: { bsonType: "string" },
        paymentGateway: { bsonType: "string" },
        status: { enum: ["pending", "success", "failed", "cancelled"] },
        gatewayResponse: { bsonType: "object" },
        refund: {
          bsonType: "object",
          properties: {
            status: { bsonType: "bool" },
            amount: { bsonType: "double" },
            refundId: { bsonType: "string" }
          }
        },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.payments.createIndex({ transactionId: 1 }, { unique: true });
db.payments.createIndex({ bookingId: 1 });
db.payments.createIndex({ userId: 1 });
db.payments.createIndex({ createdAt: -1 });

// ============================================
// INSERT SAMPLE DATA
// ============================================

// Sample Sports
db.sports.insertMany([
  { name: "Badminton", icon: "🏸", description: "Badminton sport", isActive: true },
  { name: "Football", icon: "⚽", description: "Football/Soccer", isActive: true },
  { name: "Tennis", icon: "🎾", description: "Tennis", isActive: true },
  { name: "Basketball", icon: "🏀", description: "Basketball", isActive: true },
  { name: "Cricket", icon: "🏏", description: "Cricket", isActive: true },
  { name: "Table Tennis", icon: "🏓", description: "Table Tennis", isActive: true }
]);

// Sample Users
db.users.insertMany([
  {
    email: "john@example.com",
    fullName: "John Doe",
    password: "hashed_password",
    role: "user",
    createdAt: new Date("2026-03-01"),
    updatedAt: new Date("2026-03-01"),
    metadata: { isActive: true, isBanned: false }
  },
  {
    email: "owner1@example.com",
    fullName: "Raj Kumar",
    password: "hashed_password",
    role: "owner",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    metadata: { isActive: true, isBanned: false }
  },
  {
    email: "admin@quickcourt.com",
    fullName: "Admin User",
    password: "hashed_password",
    role: "admin",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    metadata: { isActive: true, isBanned: false }
  }
]);

print("✅ Schema setup complete!");
print("Collections created: users, sports, venues, timeSlots, bookings, reviews, payments");
print("Indexes created and validated data schemas applied");
