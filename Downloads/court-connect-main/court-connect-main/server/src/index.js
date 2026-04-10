import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { User } from './models/User.js';
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

const DEFAULT_ADMIN = {
  fullName: 'Sai',
  email: 'sai@gmail.com',
  password: 'sai@123',
  role: 'admin',
};

async function ensureDefaultAdmin() {
  const email = DEFAULT_ADMIN.email.toLowerCase();
  const existing = await User.findOne({ email });

  if (!existing) {
    await User.create({
      fullName: DEFAULT_ADMIN.fullName,
      email,
      password: DEFAULT_ADMIN.password,
      role: DEFAULT_ADMIN.role,
    });
    console.log(`Default admin created: ${email}`);
    return;
  }

  let changed = false;
  if (existing.role !== 'admin') {
    existing.role = 'admin';
    changed = true;
  }
  if (existing.fullName !== DEFAULT_ADMIN.fullName) {
    existing.fullName = DEFAULT_ADMIN.fullName;
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
    console.log(`Default admin updated: ${email}`);
  }
}

async function start() {
  await connectDb();
  await ensureDefaultAdmin();
  server.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
  });
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
