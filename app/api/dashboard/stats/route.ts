import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionFromRequest();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const [totalMembers, activeMembers, expiringSoon, todayCheckIns] =
      await Promise.all([
        prisma.member.count({
          where: { gym_id: session.gym_id },
        }),
        prisma.member.count({
          where: {
            gym_id: session.gym_id,
            is_active: true,
            membership_end: { gte: new Date() },
          },
        }),
        prisma.member.count({
          where: {
            gym_id: session.gym_id,
            is_active: true,
            membership_end: {
              gte: new Date(),
              lte: sevenDaysFromNow,
            },
          },
        }),
        prisma.attendance.count({
          where: {
            gym_id: session.gym_id,
            check_in_time: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        }),
      ]);

    return NextResponse.json({
      totalMembers,
      activeMembers,
      expiringSoon,
      todayCheckIns,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
