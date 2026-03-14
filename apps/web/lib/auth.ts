export async function signup(email: string, password: string, role: 'advisor' | 'admin' | 'assistant') {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });

  const payload = await res.json();
  return { data: payload.data ?? null, error: res.ok ? null : { message: payload.error ?? 'Signup failed' } };
}

export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const payload = await res.json();
  return { data: payload.data ?? null, error: res.ok ? null : { message: payload.error ?? 'Login failed' } };
}

export async function logout() {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  const payload = await res.json();
  return { data: payload ?? null, error: res.ok ? null : { message: payload.error ?? 'Logout failed' } };
}

export async function session() {
  const res = await fetch('/api/auth/session', { cache: 'no-store' });
  const payload = await res.json();
  return { data: { session: payload.authenticated ? { authenticated: true } : null }, error: null };
}
