import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { available: false, error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { available: false, error: 'Invalid slug format' },
        { status: 400 }
      );
    }

    // Check if slug exists
    const existing = await prisma.gym.findUnique({
      where: { slug },
    });

    return NextResponse.json({
      available: !existing,
    });
  } catch (error) {
    console.error('Check slug error:', error);
    return NextResponse.json(
      { available: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
