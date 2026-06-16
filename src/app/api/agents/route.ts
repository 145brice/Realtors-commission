import { NextResponse } from 'next/server';
import { listPublicAgents } from '@/lib/appwriteServer';

export async function GET() {
  try {
    const agents = await listPublicAgents();
    return NextResponse.json({ agents });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
