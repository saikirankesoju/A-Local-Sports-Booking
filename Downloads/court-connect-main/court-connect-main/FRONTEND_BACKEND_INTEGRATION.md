# Court Connect - Frontend to Backend Integration Guide

## Current State

Your React frontend is currently:
- ✅ Using mock data from `src/data/mockData.ts`
- ✅ Using React Router for navigation
- ✅ Using React Query for state management
- ✅ Using shadcn/ui for UI components
- ❌ NOT connected to any backend API yet

## Implementation Roadmap

### Phase 1: Backend Setup (Weeks 1-2)

```
├─ Set up Node.js + Express/Fastify server
├─ Connect MongoDB with Mongoose
├─ Create MongoDB schema with validation
├─ Set up JWT authentication
├─ Create API endpoints (CRUD operations)
├─ Set up environment variables
└─ Deploy backend (Render/Railway/Fly.io)
```

**Backend Technologies:**
```json
{
  "runtime": "Node.js v18+",
  "framework": "Express.js",
  "database": "MongoDB Atlas",
  "orm": "Mongoose",
  "auth": "JWT + bcrypt",
  "validation": "Zod or Joi",
  "api-style": "RESTful",
  "testing": "Jest + Supertest",
  "deployment": "Vercel/Render"
}
```

### Phase 2: API Integration (Weeks 3-4)

Replace mock data calls with actual API calls:

```typescript
// Current (Mock)
import { venues } from '@/data/mockData';
const allVenues = venues;

// After Integration (API)
import { useQuery } from '@tanstack/react-query';

const { data: allVenues } = useQuery({
  queryKey: ['venues'],
  queryFn: () => fetch('/api/venues').then(r => r.json())
});
```

### Phase 3: Authentication (Week 5)

```typescript
// Create AuthContext that connects to backend
const { login, logout, signup, user } = useAuth();

// Uses API endpoints:
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

---

## API Integration Changes Required

### 1. Update Environment Variables

Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000
# or for production:
VITE_API_URL=https://api.courtconnect.com
```

### 2. Create API Client

Create `src/lib/api.ts`:

```typescript
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
```

### 3. Update React Query Hooks

Create `src/hooks/api/index.ts`:

```typescript
import API from '@/lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';

// Venues
export const useVenues = () => {
  return useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data } = await API.get('/venues');
      return data;
    },
  });
};

export const useVenue = (id: string) => {
  return useQuery({
    queryKey: ['venues', id],
    queryFn: async () => {
      const { data } = await API.get(`/venues/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateVenue = () => {
  return useMutation({
    mutationFn: async (venue) => {
      const { data } = await API.post('/venues', venue);
      return data;
    },
  });
};

// Bookings
export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await API.get('/bookings');
      return data;
    },
  });
};

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: async (booking) => {
      const { data } = await API.post('/bookings', booking);
      return data;
    },
  });
};
```

### 4. Update Components (Example: VenuesPage)

**Before:**
```typescript
import { venues } from '@/data/mockData';

export default function VenuesPage() {
  const [allVenues] = useState(venues);
  return (
    <div>
      {allVenues.map(v => <VenueCard key={v.id} venue={v} />)}
    </div>
  );
}
```

**After:**
```typescript
import { useVenues } from '@/hooks/api';

export default function VenuesPage() {
  const { data: allVenues = [], isLoading, error } = useVenues();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorComponent />;

  return (
    <div>
      {allVenues.map(v => <VenueCard key={v.id} venue={v} />)}
    </div>
  );
}
```

---

## API Endpoints Mapping

### Authentication
```
Frontend                          Backend
─────────────────────────────────────────
POST /login      ──────────────> POST /api/auth/login
POST /signup     ──────────────> POST /api/auth/register
POST /logout     ──────────────> POST /api/auth/logout
GET user profile ──────────────> GET /api/auth/me
```

### Venues
```
GET /venues                  ──> GET /api/venues?city=bangalore&sport=badminton
GET /venues/:id              ──> GET /api/venues/:id
GET /venues/:id/availability ──> GET /api/venues/:id/availability?date=2026-03-30
POST (owner)                 ──> POST /api/venues
PUT /venues/:id (owner)      ──> PUT /api/venues/:id
POST /venues/:id/courts      ──> POST /api/venues/:id/courts
```

### Bookings
```
GET /my-bookings             ──> GET /api/bookings
POST booking                 ──> POST /api/bookings
GET /bookings/:id            ──> GET /api/bookings/:id
PUT /bookings/:id            ──> PUT /api/bookings/:id
DELETE /bookings/:id         ──> DELETE /api/bookings/:id
```

### Reviews
```
GET /venues/:id/reviews      ──> GET /api/reviews/venue/:venueId
POST review                  ──> POST /api/reviews
```

### Admin
```
GET pending approvals        ──> GET /api/admin/venues/pending
POST approve                 ──> POST /api/admin/venues/:id/approve
GET users list               ──> GET /api/admin/users
POST ban user                ──> POST /api/admin/users/:id/ban
```

---

## Update Types (TypeScript)

Create `src/types/api.ts`:

```typescript
// Request/Response types that match your MongoDB schema

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: IUser;
}

export interface IUser {
  _id: string;
  email: string;
  fullName: string;
  role: 'user' | 'owner' | 'admin';
  avatar?: string;
}

export interface IVenue {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  address: string;
  city: string;
  sports: Sport[];
  amenities: string[];
  stats: {
    averageRating: number;
    totalReviews: number;
    totalBookings: number;
  };
  approval: {
    status: 'pending' | 'approved' | 'rejected';
  };
  courts: ICourt[];
}

export interface ICourt {
  _id: string;
  name: string;
  sportType: string;
  pricePerHour: number;
}

export interface IBooking {
  _id: string;
  bookingNumber: string;
  userId: string;
  venueId: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
}

export interface ITimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  bookingId?: string;
}
```

---

## Authentication Flow

### Login
```
User enters credentials
        ↓
Frontend calls: POST /api/auth/login { email, password }
        ↓
Backend:
  ├─ Validate credentials
  ├─ Hash password check
  ├─ Generate JWT token
  └─ Return { token, user }
        ↓
Frontend:
  ├─ Store token in localStorage
  ├─ Update AuthContext
  └─ Redirect to dashboard
```

### Protected Routes
```
User navigates to /admin/dashboard
        ↓
Frontend checks: if (!user || user.role !== 'admin')
        ↓
If not authenticated:
  └─ Redirect to /login
        ↓
If authenticated:
  ├─ Add Authorization header
  ├─ Fetch /api/admin/data
  └─ Display dashboard
```

---

## Environment Setup for Backend

Create `server/.env`:
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/courtconnect
DATABASE_NAME=courtconnect

# Server
PORT=5000
NODE_ENV=development

# Auth
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# File Storage
CLOUDINARY_NAME=your_name
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret

# Payment
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## Deployment Checklist

### Backend Deployment (Render/Railway)
- [ ] Push code to GitHub
- [ ] Create account on Render/Railway
- [ ] Connect GitHub repo
- [ ] Set environment variables
- [ ] Deploy backend
- [ ] Get API URL (e.g., https://courtconnect-api.onrender.com)
- [ ] Test endpoints

### Frontend Deployment (Vercel)
- [ ] Update VITE_API_URL to production backend URL
- [ ] Deploy to Vercel
- [ ] Test API integration in production
- [ ] Set up custom domain

### Database
- [ ] Create MongoDB Atlas account
- [ ] Create cluster
- [ ] Set up backups
- [ ] Create database user
- [ ] Whitelist IPs
- [ ] Get connection string

---

## Testing API Integration

Use Postman or Insomnia for testing:

```
### Login
POST http://localhost:5000/api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "user"
  }
}

### Get Venues
GET http://localhost:5000/api/venues?city=bangalore
Authorization: Bearer <token>

Response:
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "GreenField Sports Arena",
    "city": "Bangalore",
    ...
  }
]
```

---

## Common Issues & Solutions

### CORS Error
```
Error: Access to XMLHttpRequest from origin blocked by CORS policy

Solution:
Backend: Add CORS middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### 401 Unauthorized
```
Error: Token expired

Solution:
Implement refresh token endpoint:
POST /api/auth/refresh
Body: { refreshToken }
```

### API Timeout
```
Error: Network request timeout

Solution:
Increase timeout in API client:
const API = axios.create({ timeout: 30000 });
```

### Data Type Mismatch
```
Error: Expected string, got ObjectId

Solution:
Convert ObjectId to string in API response:
venue._id.toString()
```

---

## Next Steps

1. **Start Backend**: Create Node.js/Express project
2. **Set up MongoDB**: Create Atlas cluster and collections
3. **Create API Routes**: Implement auth, venues, bookings endpoints
4. **Test API**: Use Postman before integrating
5. **Integrate**: Replace mock data with API calls
6. **Deploy**: Push to production
7. **Monitor**: Set up error tracking (Sentry)
