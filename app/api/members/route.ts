import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest();
    
    if (!session || !session.gym_id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const skip = (page - 1) * pageSize;

    const where: any = {
      gym_id: session.gym_id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (status === 'active') {
      where.is_active = true;
      where.membership_end = { gte: today };
    } else if (status === 'expired') {
      where.membership_end = { lt: today };
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          membership_end: true,
          qr_code: true,
          created_at: true,
          is_active: true,
        },
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      prisma.member.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        members,
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest();
    
    if (!session || !session.gym_id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, membership_start, membership_end } = body;

    if (!name || !phone || !membership_start || !membership_end) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate UUID only for DB storage (no prefix)
    const qr_code = crypto.randomUUID();

    const member = await prisma.member.create({
      data: {
        gym_id: session.gym_id,
        name,
        phone,
        membership_start: new Date(membership_start),
        membership_end: new Date(membership_end),
        qr_code,
        is_active: true,
      },
    });

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
