import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = verifyOtpSchema.parse(body);

    const normalizedEmail = email.toLowerCase();

    // Find OTP record
    const otpRecord = await prisma.signupOTP.findUnique({
      where: { email: normalizedEmail },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'No password reset request found. Please request a new code.' },
        { status: 404 }
      );
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.otp_expires) {
      await prisma.signupOTP.delete({
        where: { email: normalizedEmail },
      });
      
      return NextResponse.json(
        { success: false, error: 'Password reset code has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Hash the provided OTP and compare
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    if (hashedOtp !== otpRecord.otp_code) {
      return NextResponse.json(
        { success: false, error: 'Invalid password reset code' },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await prisma.signupOTP.update({
      where: { email: normalizedEmail },
      data: { verified: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Code verified successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Verify password reset OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
