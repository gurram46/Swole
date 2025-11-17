import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if OTP exists and is not expired
    if (!adminUser.otp_code || !adminUser.otp_expires) {
      return NextResponse.json(
        { success: false, error: 'No OTP found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (new Date() > adminUser.otp_expires) {
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (adminUser.otp_code !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // Clear OTP after successful verification
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: {
        otp_code: null,
        otp_expires: null,
      },
    });

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
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
