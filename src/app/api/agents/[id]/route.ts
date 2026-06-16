import { NextResponse } from 'next/server';
import { getPublicAgentBundle } from '@/lib/appwriteServer';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bundle = await getPublicAgentBundle(id);
    return NextResponse.json(bundle);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
