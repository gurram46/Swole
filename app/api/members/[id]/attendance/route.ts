import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest();
    
    if (!session || !session.gym_id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const memberId = params.id;

    // Verify member belongs to this gym
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        gym_id: session.gym_id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // Get last 30 attendance records
    const attendance = await prisma.attendance.findMany({
      where: {
        member_id: memberId,
        gym_id: session.gym_id,
      },
      orderBy: {
        check_in_time: 'desc',
      },
      take: 30,
      select: {
        id: true,
        check_in_time: true,
        check_out_time: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error('Get member attendance error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
