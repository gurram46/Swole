import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { z } from 'zod';

const updateGymSchema = z.object({
  gym_name: z.string().min(1, 'Gym name is required'),
  gym_slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  owner_name: z.string().min(1, 'Owner name is required'),
  owner_email: z.string().email('Invalid email format'),
  owner_phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const gym = await prisma.gym.findUnique({
      where: { id: session.gym_id },
      select: {
        id: true,
        name: true,
        slug: true,
        owner_name: true,
        owner_email: true,
        owner_phone: true,
      },
    });

    if (!gym) {
      return NextResponse.json(
        { success: false, error: 'Gym not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      gym,
    });
  } catch (error) {
    console.error('Get gym settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gym settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = updateGymSchema.parse(body);

    // Check if slug is being changed and if it's available
    const currentGym = await prisma.gym.findUnique({
      where: { id: session.gym_id },
      select: { slug: true },
    });

    if (currentGym && data.gym_slug !== currentGym.slug) {
      const existingGym = await prisma.gym.findUnique({
        where: { slug: data.gym_slug },
      });

      if (existingGym) {
        return NextResponse.json(
          { success: false, error: 'Gym slug is already taken' },
          { status: 409 }
        );
      }
    }

    // Update gym
    const updatedGym = await prisma.gym.update({
      where: { id: session.gym_id },
      data: {
        name: data.gym_name,
        slug: data.gym_slug,
        owner_name: data.owner_name,
        owner_email: data.owner_email,
        owner_phone: data.owner_phone,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Gym settings updated successfully',
      gym: {
        id: updatedGym.id,
        name: updatedGym.name,
        slug: updatedGym.slug,
        owner_name: updatedGym.owner_name,
        owner_email: updatedGym.owner_email,
        owner_phone: updatedGym.owner_phone,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Update gym settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update gym settings' },
      { status: 500 }
    );
  }
}
