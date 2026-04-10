# Court Connect - Backend API Architecture

## Backend Stack Recommendations

```
├── Runtime: Node.js (v18+)
├── Language: TypeScript
├── Framework: Express.js / Fastify
├── Database: MongoDB + Mongoose ODM (or Prisma)
├── API: RESTful (or GraphQL)
├── Authentication: JWT + bcrypt
├── Payment: Stripe / Razorpay
├── File Storage: AWS S3 / Cloudinary
└── Testing: Jest + Supertest
```

---

## Mongoose Schema Files

Create these TypeScript files for type-safe database access:

### 1. models/User.ts

```typescript
import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  fullName: string;
  password: string;
  role: 'user' | 'owner' | 'admin';
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  metadata: {
    lastLogin?: Date;
    isActive: boolean;
    isBanned: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
    avatar: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    metadata: {
      lastLogin: Date,
      isActive: { type: Boolean, default: true },
      isBanned: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
```

### 2. models/Venue.ts

```typescript
import { Schema, model, Document } from 'mongoose';

interface ICourt {
  _id?: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  capacity: number;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  amenities: string[];
  isActive: boolean;
}

interface IVenue extends Document {
  name: string;
  description: string;
  ownerId: Schema.Types.ObjectId;
  ownerName: string;
  category: 'Indoor' | 'Outdoor' | 'Mixed';
  address: string;
  city: string;
  state: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number];
  };
  contactNumber?: string;
  email?: string;
  sports: Array<{ _id: string; name: string; icon: string }>;
  amenities: string[];
  priceRange: { min: number; max: number };
  operatingHours: Record<string, { open: string; close: string }>;
  photos: string[];
  about: string;
  stats: {
    totalBookings: number;
    totalReviews: number;
    averageRating: number;
    totalCourts: number;
  };
  approval: {
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: Schema.Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
  };
  courts: ICourt[];
  createdAt: Date;
  updatedAt: Date;
}

const venueSchema = new Schema<IVenue>(
  {
    name: { type: String, required: true },
    description: String,
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ownerName: String,
    category: { type: String, enum: ['Indoor', 'Outdoor', 'Mixed'] },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    contactNumber: String,
    email: String,
    sports: [{ _id: Schema.Types.ObjectId, name: String, icon: String }],
    amenities: [String],
    priceRange: { min: Number, max: Number },
    operatingHours: Schema.Types.Mixed,
    photos: [String],
    about: String,
    stats: {
      totalBookings: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalCourts: { type: Number, default: 0 }
    },
    approval: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      approvedBy: Schema.Types.ObjectId,
      approvedAt: Date,
      rejectionReason: String
    },
    courts: [
      {
        name: String,
        sportType: String,
        pricePerHour: Number,
        capacity: Number,
        operatingHoursStart: String,
        operatingHoursEnd: String,
        amenities: [String],
        isActive: { type: Boolean, default: true }
      }
    ]
  },
  { timestamps: true }
);

venueSchema.index({ ownerId: 1 });
venueSchema.index({ 'approval.status': 1 });
venueSchema.index({ city: 1 });
venueSchema.index({ coordinates: '2dsphere' });
venueSchema.index({ 'stats.averageRating': -1 });

export const Venue = model<IVenue>('Venue', venueSchema);
```

### 3. models/Booking.ts

```typescript
import { Schema, model, Document } from 'mongoose';

interface IBooking extends Document {
  bookingNumber: string;
  userId: Schema.Types.ObjectId;
  userName: string;
  userEmail: string;
  venueId: Schema.Types.ObjectId;
  venueName: string;
  courtId: Schema.Types.ObjectId;
  courtName: string;
  sportType: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  pricing: {
    pricePerHour: number;
    quantity: number;
    subtotal: number;
    discount: number;
    tax: number;
    totalPrice: number;
  };
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  participants?: Array<{ name: string; email: string; phone: string }>;
  notes?: string;
  cancellation: {
    status: boolean;
    reason?: string;
    cancelledAt?: Date;
    refundAmount?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: String,
    userEmail: String,
    venueId: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
    venueName: String,
    courtId: Schema.Types.ObjectId,
    courtName: String,
    sportType: String,
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationMinutes: Number,
    pricing: {
      pricePerHour: Number,
      quantity: Number,
      subtotal: Number,
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      totalPrice: Number
    },
    status: { type: String, enum: ['confirmed', 'pending', 'cancelled', 'completed'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: String,
    transactionId: String,
    participants: [{ name: String, email: String, phone: String }],
    notes: String,
    cancellation: {
      status: { type: Boolean, default: false },
      reason: String,
      cancelledAt: Date,
      refundAmount: Number
    }
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, date: -1 });
bookingSchema.index({ venueId: 1 });
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ bookingNumber: 1 });

export const Booking = model<IBooking>('Booking', bookingSchema);
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Venue Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/venues` | Get all venues (with filters) |
| GET | `/api/venues/:id` | Get venue details |
| POST | `/api/venues` | Create new venue (owner) |
| PUT | `/api/venues/:id` | Update venue (owner) |
| DELETE | `/api/venues/:id` | Delete venue (owner) |
| GET | `/api/venues/search` | Search venues by location/sport |
| GET | `/api/venues/:id/availability` | Get court availability |

### Booking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get user's bookings |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/:id` | Get booking details |
| PUT | `/api/bookings/:id` | Update booking |
| DELETE | `/api/bookings/:id` | Cancel booking |
| GET | `/api/bookings/venue/:venueId` | Get venue's bookings (owner) |

### Review Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/venue/:venueId` | Get venue reviews |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/venues/pending` | Get pending approvals |
| POST | `/api/admin/venues/:id/approve` | Approve venue |
| POST | `/api/admin/venues/:id/reject` | Reject venue |
| GET | `/api/admin/users` | Get all users |
| POST | `/api/admin/users/:id/ban` | Ban user |
| GET | `/api/admin/analytics` | Platform analytics |

---

## Database Connection Example

```typescript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
```

---

## Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/courtconnect

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Payment
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password

# AWS S3
AWS_BUCKET=court-connect-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...

# App
PORT=5000
NODE_ENV=development
```

---

## Integration with Frontend

Update your TypeScript types based on the Mongoose schemas:

```typescript
// src/types/index.ts
export interface IVenue {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  // ... rest of fields
}

export interface IBooking {
  _id: string;
  bookingNumber: string;
  // ... rest of fields
}
```

Then use React Query or SWR to fetch from the API:

```typescript
// hooks/useVenues.ts
import { useQuery } from '@tanstack/react-query';

export const useVenues = () => {
  return useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const res = await fetch('/api/venues');
      return res.json();
    }
  });
};
```

---

## Best Practices

1. **Connection Pooling**: Use `maxPoolSize` in MongoDB connection
2. **Indexes**: All frequently queried fields are indexed
3. **Denormalization**: Store denormalized data to avoid expensive $lookups
4. **TTL**: Time slots auto-cleanup with TTL indexes
5. **Validation**: Schema validation at database level
6. **Authentication**: JWT with refresh tokens
7. **Rate Limiting**: Implement rate limiting on API endpoints
8. **Error Handling**: Comprehensive error handling across all endpoints
9. **Logging**: Log all critical operations
10. **Security**: Use bcrypt for passwords, sanitize inputs, HTTPS only
