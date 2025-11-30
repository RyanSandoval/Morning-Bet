import { NextResponse } from 'next/server';
import { createUser } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST() {
  try {
    // Generate unique guest credentials
    const guestId = Math.random().toString(36).substring(2, 10);
    const guestEmail = `guest_${guestId}@morningbet.local`;
    const guestName = `Guest ${guestId.substring(0, 4).toUpperCase()}`;
    const guestPassword = Math.random().toString(36).substring(2, 18);

    // Create guest user
    const passwordHash = await hashPassword(guestPassword);
    const user = createUser(guestEmail, guestName, passwordHash);

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
    return NextResponse.json(
      { error: 'Failed to create guest account' },
      { status: 500 }
    );
  }
}
