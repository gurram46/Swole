import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signToken, setSessionCookie } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 login attempts per 15 minutes per IP
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`login:${clientIp}`, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimit.success) {
      const resetInMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
      return NextResponse.json(
        { 
          success: false, 
          error: `Too many login attempts. Please try again in ${resetInMinutes} minute${resetInMinutes > 1 ? 's' : ''}.` 
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const normalizedEmail = email.toLowerCase();

    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Sign JWT token
    const token = await signToken({
      admin_id: adminUser.id,
      gym_id: adminUser.gym_id,
      email: adminUser.email,
      role: adminUser.role,
    });

    // Set session cookie
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        gym: adminUser.gym,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
