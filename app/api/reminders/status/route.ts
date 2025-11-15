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

    // Get current date in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istNow = new Date(now.getTime() + istOffset);

    // Set to start of day in IST
    const todayIST = new Date(istNow);
    todayIST.setHours(0, 0, 0, 0);

    // Calculate date range (today to today + 3 days)
    const threeDaysFromNow = new Date(todayIST);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    const endOfTodayIST = new Date(todayIST);
    endOfTodayIST.setHours(23, 59, 59, 999);

    // Count members expiring soon (next 3 days, excluding today)
    const expiringSoonCount = await prisma.member.count({
      where: {
        gym_id: session.gym_id,
        is_active: true,
        membership_end: {
          gt: endOfTodayIST,
          lte: threeDaysFromNow,
        },
      },
    });

    // Count members expired today
    const expiredTodayCount = await prisma.member.count({
      where: {
        gym_id: session.gym_id,
        is_active: true,
        membership_end: {
          gte: todayIST,
          lte: endOfTodayIST,
        },
      },
    });

    // Get last reminder run
    const lastRun = await prisma.reminderLog.findFirst({
      orderBy: {
        run_at: 'desc',
      },
      select: {
        run_at: true,
        manual: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        expiringSoonCount,
        expiredTodayCount,
        lastRunAt: lastRun?.run_at || null,
        lastRunManual: lastRun?.manual || false,
      },
    });
  } catch (error) {
    console.error('Get reminder status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
