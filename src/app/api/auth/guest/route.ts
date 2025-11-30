import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Generate unique guest credentials (no database needed)
    const guestId = Math.random().toString(36).substring(2, 10);
    const guestUserId = Math.floor(Math.random() * 1000000) + 1000000; // High ID to avoid conflicts
    const guestEmail = `guest_${guestId}@example.com`;
    const guestName = `Guest ${guestId.substring(0, 4).toUpperCase()}`;

    // Create session directly (bypasses database for demo)
    await createSession({
      userId: guestUserId,
      email: guestEmail,
      name: guestName,
    });

    return NextResponse.json({
      user: {
        id: guestUserId,
        email: guestEmail,
        name: guestName,
      },
    });
  } catch (error) {
    console.error('Guest login error:', error);
    return NextResponse.json(
      { error: `Failed to create guest account: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
