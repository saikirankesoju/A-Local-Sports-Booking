# Database Setup Instructions

## Quick Start

### Prerequisites
- MongoDB account (Atlas recommended)
- MongoDB CLI (mongosh)
- Node.js 18+ (for backend integration)

### Installation Steps

#### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster (M0 tier is free)
4. Create database user with strong password
5. Whitelist IP addresses (or allow 0.0.0.0/0 for development)
6. Copy connection string

#### 2. Initialize Database

```bash
# Connect to MongoDB Atlas
mongosh "mongodb+srv://username:password@cluster.mongodb.net/courtconnect"

# Run the setup script
mongosh "mongodb+srv://username:password@cluster.mongodb.net" < mongodb-schema-setup.js

# Or manually copy-paste commands from mongodb-schema-setup.js into mongosh
```

#### 3. Verify Collections

```bash
# Check all collections created
show collections

# Expected output:
# courts
# bookings
# reviews
# sports
# users
# venues
# timeSlots
# payments
```

#### 4. Verify Indexes

```bash
# Check indexes on each collection
db.users.getIndexes()
db.venues.getIndexes()
db.bookings.getIndexes()
db.reviews.getIndexes()
db.timeSlots.getIndexes()
db.payments.getIndexes()
```

---

## Files in This Directory

- **mongodb-schema-setup.js** - Schema initialization script with all collections, validation, and indexes

---

## Connection Strings

### Development (Local)
```
mongodb://localhost:27017/courtconnect
```

### Production (MongoDB Atlas)
```
mongodb+srv://username:password@cluster.mongodb.net/courtconnect?retryWrites=true&w=majority
```

### Environment Variable Format
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/courtconnect
```

---

## Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
Solution: Make sure MongoDB is running or use Atlas connection string
```

### Authentication Failed
```
Error: Authentication failed
Solution: Check username, password, and database name in connection string
```

### Collection Already Exists
```
Error: MongoServerError: namespace already exists
Solution: Drop collections first: db.venues.drop(); db.users.drop(); etc.
```

### Index Already Exists
```
Error: E11000 duplicate key error
Solution: Safe to ignore, index already created in previous run
```

---

## Backup & Restore

### Enable Atlas Automatic Backups
1. Go to Atlas dashboard
2. Click on Backup
3. Enable Automatic Backup (enabled by default)
4. Set retention to 30+ days

### Manual Backup
```bash
# Export to file
mongoexport --uri="mongodb+srv://user:pass@cluster.mongodb.net/courtconnect" 
            --collection=venues 
            --out=venues_backup.json

# Import from file
mongoimport --uri="mongodb+srv://user:pass@cluster.mongodb.net/courtconnect" 
            --collection=venues 
            --file=venues_backup.json
```

---

## Development Workflow

### 1. Clear Database (Development Only)
```bash
# Connect to MongoDB
mongosh <connection_string>

# Drop all collections
db.dropCollection("users")
db.dropCollection("venues")
db.dropCollection("bookings")
db.dropCollection("reviews")
db.dropCollection("timeSlots")
db.dropCollection("sports")
db.dropCollection("payments")

# Re-run setup script
mongosh <connection_string> < mongodb-schema-setup.js
```

### 2. Insert Sample Data
```bash
# Already included in mongodb-schema-setup.js
# Or manually insert:

db.sports.insertMany([
  { name: "Badminton", icon: "🏸" },
  { name: "Tennis", icon: "🎾" }
])
```

### 3. Monitor Queries
In MongoDB Atlas dashboard:
1. Go to Monitoring > Query Performance Insights
2. View slow queries
3. Optimize with better indexes

---

## Performance Monitoring

### In MongoDB Atlas

1. **Performance Advisor**
   - Suggests indexes
   - Identifies slow queries
   - Recommends optimizations

2. **Query Profiler**
   - See slow queries
   - View query execution plans
   - Understand bottlenecks

3. **Database Metrics**
   - CPU, memory, disk usage
   - Network I/O
   - Operations per second

### Console Commands

```bash
# Check database size
db.stats()

# Check collection statistics
db.venues.stats()

# Find slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 }).limit(10)

# Enable profiling
db.setProfilingLevel(1, { slowms: 100 })
```

---

## Migration from Existing Database

### Export from Old Database
```bash
mongoexport --uri="mongodb://oldhost:27017/olddb" \
            --collection=venues \
            --out=venues.json
```

### Import to New Database
```bash
mongoimport --uri="mongodb+srv://user:pass@cluster.mongodb.net/courtconnect" \
            --collection=venues \
            --file=venues.json
```

### Data Transformation
If schema changed, use aggregation pipeline:
```javascript
db.venues.aggregate([
  {
    $project: {
      _id: 1,
      name: 1,
      newField: { $substr: ["$oldField", 0, 10] }
    }
  },
  { $out: "venues" }
])
```

---

## Scaling Tips

### When to Shard
```
Single server limit: ~100 GB
Shard when: Collection exceeds 100 GB or >100K queries/sec

Shard key strategy:
├─ userId: Good for user-centric app
├─ venueId: Good if some venues get spike
└─ Composite: userId + date for time-series
```

### Connection Pool
```javascript
// Node.js Mongoose
mongoose.connect(uri, {
  maxPoolSize: 10,           // Number of connections
  minPoolSize: 5,            // Minimum connections
  waitQueueTimeoutMS: 10000  // Wait 10s for connection
})
```

### Read Replicas
```javascript
// Read from secondary replicas for reporting
mongoose.connect(uri, {
  readPreference: 'secondaryPreferred'
})
```

---

## Important Gotchas

⚠️ **Never do this in production:**
- Delete collections without backup
- Change index strategy without testing
- Accept unlimited document sizes
- Store unencrypted passwords
- Allow unauthenticated MongoDB access
- Use weak connection strings

✅ **Always do this:**
- Test schema changes on staging first
- Monitor disk space usage
- Review slow query logs
- Keep passwords secure
- Use strong authentication
- Regular backups enabled
- IP whitelist configured

---

## Support

For MongoDB-specific issues, consult:
- [MongoDB Docs](https://docs.mongodb.com)
- [Atlas FAQ](https://www.mongodb.com/docs/atlas/reference/faq/)
- MongoDB Community Forum

For application integration issues, see:
- BACKEND_ARCHITECTURE.md
- FRONTEND_BACKEND_INTEGRATION.md
