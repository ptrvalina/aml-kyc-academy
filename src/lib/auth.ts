import {
  api,
  getAuthToken,
  isApiEnabled,
  setAuthToken,
  type ApiUser,
  type UserProgress,
} from './api';

export type UserAccount = {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
};

const USERS_KEY = 'aml-kyc-academy:users';
const SESSION_KEY = 'aml-kyc-academy:session-user-id';
const CACHED_USER_KEY = 'aml-kyc-academy:cached-user';

function loadLocalUsers(): Array<UserAccount & { password: string }> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

function saveLocalUsers(users: Array<UserAccount & { password: string }>): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function cacheUser(user: UserAccount): void {
  localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
  localStorage.setItem(SESSION_KEY, user.id);
}

function readCachedUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    if (raw) return JSON.parse(raw) as UserAccount;
  } catch {
    /* ignore */
  }
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const local = loadLocalUsers().find((u) => u.id === id);
  if (!local) return null;
  return { id: local.id, email: local.email, fullName: local.fullName, createdAt: local.createdAt };
}

function toAccount(user: ApiUser): UserAccount {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    createdAt: user.createdAt,
  };
}

export function getSessionUser(): UserAccount | null {
  return readCachedUser();
}

export function isServerAuth(): boolean {
  return isApiEnabled() && Boolean(getAuthToken());
}

export async function refreshSession(): Promise<UserAccount | null> {
  if (!isApiEnabled() || !getAuthToken()) return readCachedUser();
  try {
    const { user, progress } = await api.me();
    cacheUser(toAccount(user));
    if (progress && Object.keys(progress).length > 0) {
      applyServerProgress(progress);
    }
    return toAccount(user);
  } catch {
    setAuthToken(null);
    localStorage.removeItem(CACHED_USER_KEY);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function registerUser(input: {
  email: string;
  fullName: string;
  password: string;
}): Promise<{ ok: true; user: UserAccount } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes('@')) return { ok: false, error: 'invalid_email' };
  if (!input.fullName.trim()) return { ok: false, error: 'invalid_name' };
  if (input.password.length < (isApiEnabled() ? 8 : 6)) return { ok: false, error: 'weak_password' };

  if (isApiEnabled()) {
    try {
      const res = await api.register({
        email,
        password: input.password,
        fullName: input.fullName.trim(),
      });
      setAuthToken(res.token);
      cacheUser(toAccount(res.user));
      return { ok: true, user: toAccount(res.user) };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'register_failed';
      if (msg.includes('already registered') || msg.includes('409')) return { ok: false, error: 'email_taken' };
      return { ok: false, error: 'network_error' };
    }
  }

  const users = loadLocalUsers();
  if (users.some((u) => u.email === email)) return { ok: false, error: 'email_taken' };

  const user: UserAccount & { password: string } = {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    fullName: input.fullName.trim(),
    password: input.password,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveLocalUsers(users);
  cacheUser(user);
  return { ok: true, user };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ ok: true; user: UserAccount } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();

  if (isApiEnabled()) {
    try {
      const res = await api.login({ email: normalized, password });
      setAuthToken(res.token);
      cacheUser(toAccount(res.user));
      const me = await api.me();
      if (me.progress && Object.keys(me.progress).length > 0) {
        applyServerProgress(me.progress);
      }
      return { ok: true, user: toAccount(res.user) };
    } catch {
      return { ok: false, error: 'invalid_credentials' };
    }
  }

  const user = loadLocalUsers().find((u) => u.email === normalized && u.password === password);
  if (!user) return { ok: false, error: 'invalid_credentials' };
  cacheUser(user);
  return { ok: true, user };
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CACHED_USER_KEY);
  setAuthToken(null);
}

export function updateSessionUser(patch: Partial<Pick<UserAccount, 'fullName' | 'email'>>): UserAccount | null {
  const current = getSessionUser();
  if (!current) return null;

  if (isApiEnabled()) return current;

  const users = loadLocalUsers();
  const idx = users.findIndex((u) => u.id === current.id);
  if (idx < 0) return null;
  const next = { ...users[idx], ...patch };
  if (patch.email) next.email = patch.email.trim().toLowerCase();
  users[idx] = next;
  saveLocalUsers(users);
  cacheUser(next);
  return next;
}

const PROGRESS_KEYS: Record<keyof UserProgress, string> = {
  passedModules: 'passed-modules',
  passedOsint: 'passed-osint-modules',
  certified: 'final-certified',
  osintCertified: 'osint-certified',
  completedTasks: 'completed-tasks',
};

export function applyServerProgress(progress: UserProgress): void {
  if (progress.passedModules) {
    localStorage.setItem(PROGRESS_KEYS.passedModules, JSON.stringify(progress.passedModules));
  }
  if (progress.passedOsint) {
    localStorage.setItem(PROGRESS_KEYS.passedOsint, JSON.stringify(progress.passedOsint));
  }
  if (typeof progress.certified === 'boolean') {
    localStorage.setItem(PROGRESS_KEYS.certified, JSON.stringify(progress.certified));
  }
  if (typeof progress.osintCertified === 'boolean') {
    localStorage.setItem(PROGRESS_KEYS.osintCertified, JSON.stringify(progress.osintCertified));
  }
  if (progress.completedTasks) {
    localStorage.setItem(PROGRESS_KEYS.completedTasks, JSON.stringify(progress.completedTasks));
  }
}

export function readLocalProgress(): UserProgress {
  const read = <T>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };
  return {
    passedModules: read(PROGRESS_KEYS.passedModules, []),
    passedOsint: read(PROGRESS_KEYS.passedOsint, []),
    certified: read(PROGRESS_KEYS.certified, false),
    osintCertified: read(PROGRESS_KEYS.osintCertified, false),
    completedTasks: read(PROGRESS_KEYS.completedTasks, []),
  };
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleProgressSync(): void {
  if (!isApiEnabled() || !getAuthToken()) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void api.saveProgress(readLocalProgress()).catch(() => {
      /* silent — offline or server down */
    });
  }, 1500);
}
