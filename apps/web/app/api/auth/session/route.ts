import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const authenticated = cookieHeader.includes('df_access_token=');
  return NextResponse.json({ authenticated });
}
