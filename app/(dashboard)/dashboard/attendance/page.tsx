import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { QrCode, Calendar, Clock } from 'lucide-react';

async function getAttendance(date?: string) {
  try {
    const url = date 
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/attendance?date=${date}`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/attendance`;
    
    const response = await fetch(url, {
      cache: 'no-store',
    });
    
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    return null;
  }
}

export default async function AttendancePage() {
  const today = new Date().toISOString().split('T')[0];
  const todayData = await getAttendance(today);
  const allData = await getAttendance();

  const todayAttendance = todayData?.data?.attendance || [];
  const recentAttendance = allData?.data?.attendance?.slice(0, 20) || [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-2">
          Track member check-ins and check-outs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/10 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>QR Scanner</CardTitle>
            <CardDescription>Scan member QR codes for attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <QrCode className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">QR Scanner</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Open the QR scanner to record member attendance
              </p>
              <Link href="/dashboard/scanner">
                <Button>
                  <QrCode className="w-4 h-4 mr-2" />
                  Open Scanner
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>{format(new Date(), 'PPP')}</CardDescription>
          </CardHeader>
          <CardContent>
            {todayAttendance.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No check-ins today</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Attendance records will appear here once members start checking in
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {todayAttendance.length} check-in{todayAttendance.length !== 1 ? 's' : ''} today
                  </p>
                </div>
                <div className="space-y-2">
                  {todayAttendance.slice(0, 5).map((record: any) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10"
                    >
                      <div>
                        <p className="font-medium">{record.member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(record.check_in_time), 'p')}
                          {record.check_out_time && (
                            <> - {format(new Date(record.check_out_time), 'p')}</>
                          )}
                        </p>
                      </div>
                      <Badge variant={record.check_out_time ? 'secondary' : 'default'}>
                        {record.check_out_time ? 'Checked Out' : 'Active'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Last 20 attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAttendance.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No history available</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Historical attendance data will be displayed here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAttendance.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Link 
                          href={`/dashboard/members/${record.member.id}`}
                          className="font-medium hover:underline"
                        >
                          {record.member.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.member.phone}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(record.check_in_time), 'MMM d, p')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.check_out_time ? (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(record.check_out_time), 'MMM d, p')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.check_out_time ? 'secondary' : 'default'}>
                          {record.check_out_time ? 'Completed' : 'Active'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
