import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from '../db.js';
import { signToken } from '../middleware/auth.js';

const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(120),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const defaultProgress = () => ({
  passedModules: [] as string[],
  passedOsint: [] as string[],
  certified: false,
  completedTasks: [] as string[],
});

export const authRouter = Router();

authRouter.post('/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  const { email, password, fullName } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const id = randomUUID();
  const passwordHash = bcrypt.hashSync(password, 12);
  const createdAt = new Date().toISOString();

  db.prepare(
    'INSERT INTO users (id, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, ?)',
  ).run(id, normalizedEmail, passwordHash, fullName.trim(), createdAt);

  db.prepare(
    'INSERT INTO user_progress (user_id, progress_json, updated_at) VALUES (?, ?, ?)',
  ).run(id, JSON.stringify(defaultProgress()), createdAt);

  const token = signToken({ userId: id, email: normalizedEmail });
  res.status(201).json({
    token,
    user: { id, email: normalizedEmail, fullName: fullName.trim(), createdAt },
  });
});

authRouter.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }
  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const row = db
    .prepare('SELECT id, email, password_hash, full_name, created_at FROM users WHERE email = ?')
    .get(normalizedEmail) as
    | { id: string; email: string; password_hash: string; full_name: string; created_at: string }
    | undefined;

  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken({ userId: row.id, email: row.email });
  res.json({
    token,
    user: {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      createdAt: row.created_at,
    },
  });
});
