import { NextResponse } from 'next/server';
import { createUser } from '@/lib/supabase';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Generate unique guest credentials
    const guestId = Math.random().toString(36).substring(2, 10);
    const guestEmail = `guest_${guestId}@example.com`;
    const guestName = `Guest ${guestId.substring(0, 4).toUpperCase()}`;
    const guestPassword = Math.random().toString(36).substring(2, 18);

    // Create real user in Supabase
    const passwordHash = await hashPassword(guestPassword);
    const user = await createUser(guestEmail, guestName, passwordHash);

    // Create session
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Guest login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      {
        error: `Failed to create guest account: ${errorMessage}`,
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}
