import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { z } from 'zod';

const updateAdminSchema = z.object({
  email: z.string().email('Invalid email format'),
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

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.admin_id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin settings' },
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
    const data = updateAdminSchema.parse(body);

    // Check if email is being changed and if it's available
    const currentAdmin = await prisma.adminUser.findUnique({
      where: { id: session.admin_id },
      select: { email: true },
    });

    if (currentAdmin && data.email !== currentAdmin.email) {
      const existingAdmin = await prisma.adminUser.findUnique({
        where: { email: data.email },
      });

      if (existingAdmin) {
        return NextResponse.json(
          { success: false, error: 'Email is already registered' },
          { status: 409 }
        );
      }
    }

    // Update admin email
    const updatedAdmin = await prisma.adminUser.update({
      where: { id: session.admin_id },
      data: {
        email: data.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin email updated successfully. Please log in again with your new email.',
      admin: {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Update admin settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update admin settings' },
      { status: 500 }
    );
  }
}
