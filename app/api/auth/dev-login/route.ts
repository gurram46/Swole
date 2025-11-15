import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signToken, setSessionCookie } from '@/lib/auth';

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    // Find any admin user (first one)
    const adminUser = await prisma.adminUser.findFirst({
      include: { gym: true },
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'No admin user found in database' },
        { status: 404 }
      );
    }

    // Generate JWT
    const token = await signToken({
      admin_id: adminUser.id,
      gym_id: adminUser.gym_id,
      email: adminUser.email,
      role: adminUser.role,
    });

    // Set session cookie
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Dev login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
