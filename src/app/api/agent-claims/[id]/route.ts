import { NextRequest, NextResponse } from 'next/server';
import { approveAgentClaim, isAdminEmail, rejectAgentClaim } from '@/lib/appwriteServer';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!isAdminEmail(body.admin_email || '')) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const claim =
      body.status === 'approved'
        ? await approveAgentClaim(id, body.admin_note || '')
        : await rejectAgentClaim(id, body.admin_note || '');

    return NextResponse.json({ claim });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
