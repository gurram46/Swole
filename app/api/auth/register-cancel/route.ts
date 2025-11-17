import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const cancelSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = cancelSchema.parse(body);

    // Delete signup OTP record if exists
    await prisma.signupOTP.deleteMany({
      where: { email },
    });

    return NextResponse.json({
      success: true,
      message: 'Signup cancelled successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Register cancel error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel signup.' },
      { status: 500 }
    );
  }
}
