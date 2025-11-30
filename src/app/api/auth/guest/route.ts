import { NextResponse } from 'next/server';
import { createUser } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST() {
  try {
    // Generate unique guest credentials
    const guestId = Math.random().toString(36).substring(2, 10);
    const guestEmail = `guest_${guestId}@example.com`;
    const guestName = `Guest ${guestId.substring(0, 4).toUpperCase()}`;
    const guestPassword = Math.random().toString(36).substring(2, 18);

    let user;

    try {
      // Create guest user
      const passwordHash = await hashPassword(guestPassword);
      user = createUser(guestEmail, guestName, passwordHash);
    } catch (dbError) {
      // If DB fails, return specific error
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown'}` },
        { status: 500 }
      );
    }

    try {
      // Create session
      await createSession({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { error: `Session error: ${sessionError instanceof Error ? sessionError.message : 'Unknown'}` },
        { status: 500 }
      );
    }

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
      { error: `Failed to create guest account: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
