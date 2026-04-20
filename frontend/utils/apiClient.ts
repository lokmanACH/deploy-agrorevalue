const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const WS_URL   = process.env.NEXT_PUBLIC_WS_URL  || 'ws://localhost:8000';

export { WS_URL };

// ─── Image URL utilities ────────────────────────────────────────────────────

/** Format image URL to ensure it's absolute */
export function formatImageUrl(url?: string): string {
  if (!url) return 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop';
  
  // If it's already a full URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path, prepend the API base URL
  if (url.startsWith('/')) {
    return `${BASE_URL}${url}`;
  }
  
  // Otherwise return the default
  return 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop';
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  first_name: string;
  last_name: string;
  avatar?: string;
  company_name?: string;
  is_verified: boolean;
  is_active: boolean;
}

/** Store the token + user after a successful sign-in */
export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem('agro_token', token);
  localStorage.setItem('agro_user', JSON.stringify(user));
}

/** Read the stored JWT (null if not signed in) */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agro_token');
}

/** Read the stored user object (null if not signed in) */
export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('agro_user');
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}

/** Clear stored credentials (sign-out) */
export function logout() {
  localStorage.removeItem('agro_token');
  localStorage.removeItem('agro_user');
}

// ─── HTTP client ──────────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions extends RequestInit {
  data?: any;
  /** Skip attaching the Authorization header (e.g. for /signin) */
  skipAuth?: boolean;
}

async function fetchClient<T>(
  path: string,
  method: HttpMethod,
  options: RequestOptions = {}
): Promise<T> {
  const { data, headers: customHeaders, skipAuth, ...customConfig } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  // Attach JWT from localStorage unless caller opts out
  if (!skipAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    ...customConfig,
  };

  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }

  const url = `${BASE_URL}/api/${path}`;

  try {
    const response = await fetch(url, config);

    if (response.status === 204) return null as unknown as T;

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || result?.message || `HTTP ${response.status}`);
    }

    return result as T;
  } catch (error) {
    console.error(`[apiClient] ${method} ${url} failed:`, error);
    throw error;
  }
}

/**
 * Sign in — calls POST /signin (no auth header needed).
 * Stores the token + user in localStorage automatically.
 */
export async function signIn(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result.message || 'Identifiants invalides');
  }

  saveAuth(result.token, result.user as AuthUser);
  return result.user as AuthUser;
}

/** Exported typed API methods (all send Bearer token automatically) */
export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'data'>) =>
    fetchClient<T>(path, 'GET', options),

  post: <T>(path: string, data: any, options?: Omit<RequestOptions, 'data'>) =>
    fetchClient<T>(path, 'POST', { ...options, data }),

  put: <T>(path: string, data: any, options?: Omit<RequestOptions, 'data'>) =>
    fetchClient<T>(path, 'PUT', { ...options, data }),

  patch: <T>(path: string, data: any, options?: Omit<RequestOptions, 'data'>) =>
    fetchClient<T>(path, 'PATCH', { ...options, data }),

  delete: <T>(path: string, options?: Omit<RequestOptions, 'data'>) =>
    fetchClient<T>(path, 'DELETE', options),
};

