import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authPages = ['/login', '/register'];

async function isValidSupabaseToken(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return false;
  }

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  return response.ok;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('df_access_token')?.value;
  const isAuthPage = authPages.includes(pathname);
  const isAuthenticated = token ? await isValidSupabaseToken(token) : false;

  if (!isAuthenticated && isAuthPage) {
    const response = NextResponse.next();
    if (token) {
      response.cookies.delete('df_access_token');
    }
    return response;
  }

  if (!isAuthenticated && !isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(url);
    if (token) {
      response.cookies.delete('df_access_token');
    }
    return response;
  }

  if (isAuthenticated && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
