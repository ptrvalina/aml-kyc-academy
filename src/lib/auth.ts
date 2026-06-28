export type UserAccount = {
  id: string;
  email: string;
  fullName: string;
  password: string;
  createdAt: string;
};

const USERS_KEY = 'aml-kyc-academy:users';
const SESSION_KEY = 'aml-kyc-academy:session-user-id';

function loadUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw) as UserAccount[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveUsers(users: UserAccount[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSessionUser(): UserAccount | null {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return loadUsers().find((u) => u.id === id) ?? null;
}

export function registerUser(input: { email: string; fullName: string; password: string }): { ok: true; user: UserAccount } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes('@')) return { ok: false, error: 'invalid_email' };
  if (!input.fullName.trim()) return { ok: false, error: 'invalid_name' };
  if (input.password.length < 6) return { ok: false, error: 'weak_password' };

  const users = loadUsers();
  if (users.some((u) => u.email === email)) return { ok: false, error: 'email_taken' };

  const user: UserAccount = {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    fullName: input.fullName.trim(),
    password: input.password,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, user.id);
  return { ok: true, user };
}

export function loginUser(email: string, password: string): { ok: true; user: UserAccount } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  const user = loadUsers().find((u) => u.email === normalized && u.password === password);
  if (!user) return { ok: false, error: 'invalid_credentials' };
  localStorage.setItem(SESSION_KEY, user.id);
  return { ok: true, user };
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function updateSessionUser(patch: Partial<Pick<UserAccount, 'fullName' | 'email'>>): UserAccount | null {
  const current = getSessionUser();
  if (!current) return null;
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === current.id);
  if (idx < 0) return null;
  const next = { ...users[idx], ...patch };
  if (patch.email) next.email = patch.email.trim().toLowerCase();
  users[idx] = next;
  saveUsers(users);
  return next;
}
