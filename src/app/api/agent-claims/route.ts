import { NextRequest, NextResponse } from 'next/server';
import { isAdminEmail, listAgentClaims, upsertAgentClaim } from '@/lib/appwriteServer';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email') || '';
    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const claims = await listAgentClaims();
    return NextResponse.json({ claims });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const claim = await upsertAgentClaim(body);
    return NextResponse.json({ claim });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
