import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signToken, setSessionCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  gym_name: z.string().min(1, 'Gym name is required'),
  gym_slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  gym_address: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  owner_name: z.string().min(1, 'Owner name is required'),
  owner_email: z.string().email('Invalid email format'),
  owner_phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Verify OTP was verified
    const otpRecord = await prisma.signupOTP.findUnique({
      where: { email: data.owner_email },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'No verification found. Please start signup again.' },
        { status: 400 }
      );
    }

    if (!otpRecord.verified) {
      return NextResponse.json(
        { success: false, error: 'Email not verified. Please verify your OTP first.' },
        { status: 400 }
      );
    }

    // Check if OTP has expired (even if verified)
    if (new Date() > otpRecord.otp_expires) {
      await prisma.signupOTP.delete({
        where: { email: data.owner_email },
      });
      
      return NextResponse.json(
        { success: false, error: 'Verification expired. Please start signup again.' },
        { status: 410 }
      );
    }

    // Check if slug is still available
    const existingGym = await prisma.gym.findUnique({
      where: { slug: data.gym_slug },
    });

    if (existingGym) {
      return NextResponse.json(
        { success: false, error: 'Gym slug is no longer available. Please choose another.' },
        { status: 409 }
      );
    }

    // Check if email is already registered
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: data.owner_email },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Email already registered. Please use login instead.' },
        { status: 409 }
      );
    }

    // Calculate trial end date (15 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 15);

    // Hash password
    const password_hash = await bcrypt.hash(data.password, 12);

    // Create Gym and AdminUser in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create Gym
      const gym = await tx.gym.create({
        data: {
          name: data.gym_name,
          slug: data.gym_slug,
          owner_name: data.owner_name,
          owner_email: data.owner_email,
          owner_phone: data.owner_phone,
        },
      });

      // Create AdminUser (owner) with password hash
      const admin = await tx.adminUser.create({
        data: {
          gym_id: gym.id,
          email: data.owner_email,
          password_hash: password_hash,
          role: 'owner',
        },
      });

      // Delete the used OTP
      await tx.signupOTP.delete({
        where: { email: data.owner_email },
      });

      return { gym, admin };
    });

    // Sign JWT token
    const token = await signToken({
      admin_id: result.admin.id,
      gym_id: result.gym.id,
      email: result.admin.email,
      role: result.admin.role,
    });

    // Set session cookie
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Gym created successfully',
      redirect: '/dashboard/onboarding',
      gym: {
        id: result.gym.id,
        name: result.gym.name,
        slug: result.gym.slug,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Register finalize error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create gym. Please try again.' },
      { status: 500 }
    );
  }
}
