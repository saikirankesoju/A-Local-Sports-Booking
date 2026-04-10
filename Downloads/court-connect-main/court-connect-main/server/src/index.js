import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { User } from './models/User.js';
import { AuthSession } from './models/AuthSession.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.corsOrigin, credentials: true },
});

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'court-connect-api' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

io.on('connection', socket => {
  socket.emit('connected', { message: 'Court Connect realtime channel ready' });
});

const DEFAULT_USERS = [
  { fullName: 'Sai', email: 'sai@gmail.com', password: 'sai@123', role: 'admin' },
  { fullName: 'Saikiran', email: 'saikiran@gmail.com', password: 'sai@1234', role: 'owner' },
  { fullName: 'Sai Runner', email: 'sairunner@gmail.com', password: 'sai@12345', role: 'user' },
];

async function ensureDefaultUsers() {
  const allowedEmails = DEFAULT_USERS.map(user => user.email.toLowerCase());

  for (const defaultUser of DEFAULT_USERS) {
    const email = defaultUser.email.toLowerCase();
    const existing = await User.findOne({ email });

    if (!existing) {
      await User.create({
        fullName: defaultUser.fullName,
        email,
        password: defaultUser.password,
        role: defaultUser.role,
      });
      console.log(`Default user created: ${email}`);
      continue;
    }

    let changed = false;
    if (existing.role !== defaultUser.role) {
      existing.role = defaultUser.role;
      changed = true;
    }
    if (existing.fullName !== defaultUser.fullName) {
      existing.fullName = defaultUser.fullName;
      changed = true;
    }
    if (existing.password !== defaultUser.password) {
      existing.password = defaultUser.password;
      changed = true;
    }
    if (!existing.isActive) {
      existing.isActive = true;
      changed = true;
    }
    if (existing.isBanned) {
      existing.isBanned = false;
      changed = true;
    }

    if (changed) {
      await existing.save();
      console.log(`Default user updated: ${email}`);
    }
  }

  const removedUsers = await User.find({ email: { $nin: allowedEmails } }).select('_id email');
  if (removedUsers.length > 0) {
    await AuthSession.deleteMany({ userId: { $in: removedUsers.map(user => user._id) } });
    await User.deleteMany({ _id: { $in: removedUsers.map(user => user._id) } });
    console.log(`Removed ${removedUsers.length} non-whitelisted users`);
  }
}

async function start() {
  await connectDb();
  await ensureDefaultUsers();
  server.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
  });
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
