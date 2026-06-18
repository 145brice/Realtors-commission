import { NextRequest, NextResponse } from 'next/server';
import { createReview, verifyUserRequest } from '@/lib/appwriteServer';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyUserRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Sign in required to leave a review.' }, { status: 401 });
    }

    const body = await request.json();
    const { agent_id, reviewer_name, rating, comment, property_type, transaction_type } = body;

    if (!agent_id || !reviewer_name || !rating || !comment || !transaction_type) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    const review = await createReview(agent_id, {
      reviewer_name: String(reviewer_name).slice(0, 100),
      rating: Number(rating),
      comment: String(comment).slice(0, 2000),
      property_type: String(property_type || 'Residential').slice(0, 50),
      transaction_type: transaction_type === 'sell' ? 'sell' : 'buy',
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
