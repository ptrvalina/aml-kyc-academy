const EXPLICIT_API = import.meta.env.VITE_API_URL as string | undefined;
const API_BASE = EXPLICIT_API?.replace(/\/$/, '') ?? (import.meta.env.DEV ? '' : '');

export function isApiEnabled(): boolean {
  if (import.meta.env.VITE_USE_API === 'false') return false;
  if (EXPLICIT_API) return true;
  return import.meta.env.DEV;
}

export function getApiBase(): string {
  return API_BASE;
}

const TOKEN_KEY = 'aml-kyc-academy:auth-token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = API_BASE ? `${API_BASE}${path}` : path;
  const res = await fetch(url, { ...init, headers });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text };
    }
  }

  if (!res.ok) {
    const err = body as { error?: string };
    throw new ApiError(err.error ?? res.statusText, res.status, err.error);
  }
  return body as T;
}

export type ApiUser = {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
};

export type UserProgress = {
  passedModules?: string[];
  passedOsint?: string[];
  certified?: boolean;
  osintCertified?: boolean;
  completedTasks?: string[];
};

export const api = {
  health: () => request<{ ok: boolean }>('/api/health'),

  register: (data: { email: string; password: string; fullName: string }) =>
    request<{ token: string; user: ApiUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: ApiUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<{ user: ApiUser; progress: UserProgress }>('/api/user/me'),

  saveProgress: (progress: UserProgress) =>
    request<{ progress: UserProgress }>('/api/user/progress', {
      method: 'PUT',
      body: JSON.stringify(progress),
    }),

  news: (lang: string) =>
    request<{ items: Array<{
      id: string;
      date: string;
      tag: string;
      title: string;
      summary: string;
      body: string;
      quiz?: { question: string; options: string[]; correctIndex: number };
    }>; lang: string }>(`/api/news?lang=${encodeURIComponent(lang)}`),
};
