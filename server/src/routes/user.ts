import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import type { Request } from 'express';
import type { AuthPayload } from '../middleware/auth.js';

type AuthedRequest = Request & { auth: AuthPayload };

const progressSchema = z.object({
  passedModules: z.array(z.string()).optional(),
  passedOsint: z.array(z.string()).optional(),
  certified: z.boolean().optional(),
  completedTasks: z.array(z.string()).optional(),
});

export const userRouter = Router();

userRouter.get('/me', requireAuth, (req, res) => {
  const { userId } = (req as AuthedRequest).auth;
  const row = db
    .prepare('SELECT id, email, full_name, created_at FROM users WHERE id = ?')
    .get(userId) as
    | { id: string; email: string; full_name: string; created_at: string }
    | undefined;

  if (!row) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const progressRow = db
    .prepare('SELECT progress_json FROM user_progress WHERE user_id = ?')
    .get(userId) as { progress_json: string } | undefined;

  res.json({
    user: {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      createdAt: row.created_at,
    },
    progress: progressRow ? JSON.parse(progressRow.progress_json) : {},
  });
});

userRouter.put('/progress', requireAuth, (req, res) => {
  const { userId } = (req as AuthedRequest).auth;
  const parsed = progressSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid progress payload' });
    return;
  }

  const existing = db
    .prepare('SELECT progress_json FROM user_progress WHERE user_id = ?')
    .get(userId) as { progress_json: string } | undefined;

  const merged = {
    ...(existing ? JSON.parse(existing.progress_json) : {}),
    ...parsed.data,
  };
  const updatedAt = new Date().toISOString();

  if (existing) {
    db.prepare('UPDATE user_progress SET progress_json = ?, updated_at = ? WHERE user_id = ?').run(
      JSON.stringify(merged),
      updatedAt,
      userId,
    );
  } else {
    db.prepare('INSERT INTO user_progress (user_id, progress_json, updated_at) VALUES (?, ?, ?)').run(
      userId,
      JSON.stringify(merged),
      updatedAt,
    );
  }

  res.json({ progress: merged, updatedAt });
});
