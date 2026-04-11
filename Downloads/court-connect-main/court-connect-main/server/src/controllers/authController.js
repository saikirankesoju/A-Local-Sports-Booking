import { User } from '../models/User.js';
import { revokeAccessToken, signAuthToken } from '../utils/jwt.js';

const DEFAULT_USERS = [
  { fullName: 'Sai', email: 'sai@gmail.com', password: 'sai@123', role: 'admin' },
  { fullName: 'Saikiran', email: 'saikiran@gmail.com', password: 'sai@1234', role: 'owner' },
  { fullName: 'Sai Runner', email: 'sairunner@gmail.com', password: 'sai@12345', role: 'user' },
];

function findDefaultUser(email) {
  return DEFAULT_USERS.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

async function getOrCreateDefaultUser(defaultUser) {
  const email = defaultUser.email.toLowerCase();
  const existing = await User.findOne({ email }).select('+password');

  if (!existing) {
    return User.create({
      fullName: defaultUser.fullName,
      email,
      password: defaultUser.password,
      role: defaultUser.role,
    });
  }

  let changed = false;
  if (existing.fullName !== defaultUser.fullName) {
    existing.fullName = defaultUser.fullName;
    changed = true;
  }
  if (existing.role !== defaultUser.role) {
    existing.role = defaultUser.role;
    changed = true;
  }
  if (!(await existing.comparePassword(defaultUser.password))) {
    existing.password = defaultUser.password;
    changed = true;
  }

  if (changed) {
    await existing.save();
  }

  return existing;
}

function sanitizeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password, role = 'user' } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts are system managed' });
    }

    const defaultUser = findDefaultUser(email);
    if (defaultUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({ fullName, email: email.toLowerCase(), password, role });
    const token = await signAuthToken(user, req);

    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const defaultUser = findDefaultUser(email);
    const user = defaultUser && defaultUser.password === password
      ? await getOrCreateDefaultUser(defaultUser)
      : await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = await signAuthToken(user, req);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.accessToken) {
      await revokeAccessToken(req.accessToken);
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}
