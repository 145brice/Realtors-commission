import { NextRequest, NextResponse } from 'next/server';
import { approveAgentClaim, rejectAgentClaim, verifyAdminRequest } from '@/lib/appwriteServer';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdminRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const claim =
      body.status === 'approved'
        ? await approveAgentClaim(id, body.admin_note || '')
        : await rejectAgentClaim(id, body.admin_note || '');

    return NextResponse.json({ claim });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
