'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Edit,
  RefreshCw,
  Download,
  Copy,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  phone: string;
  membership_start: string;
  membership_end: string;
  is_active: boolean;
  qr_code: string;
  notes?: string;
  created_at: string;
}

interface Attendance {
  id: string;
  check_in_time: string;
}

const editSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  notes: z.string().optional(),
});

type EditFormData = z.infer<typeof editSchema>;

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [member, setMember] = useState<Member | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewDuration, setRenewDuration] = useState('1');
  const [renewLoading, setRenewLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: editErrors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    fetchMember();
    fetchAttendance();
  }, [memberId]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/members/${memberId}`);
      const data = await response.json();

      if (data.member) {
        setMember(data.member);
        reset({
          name: data.member.name,
          phone: data.member.phone,
          notes: data.member.notes || '',
        });
      } else {
        setError('Member not found');
      }
    } catch (err) {
      setError('Failed to load member');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/members/${memberId}/attendance`);
      const data = await response.json();
      if (data.attendance) {
        setAttendance(data.attendance);
      }
    } catch (err) {
      console.error('Failed to load attendance');
    }
  };

  const handleEdit = async (data: EditFormData) => {
    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchMember();
        setEditOpen(false);
      }
    } catch (err) {
      alert('Failed to update member');
    }
  };

  const handleRenew = async () => {
    if (!member) return;

    setRenewLoading(true);
    try {
      const start = new Date(member.membership_end);
      const end = new Date(start);
      end.setMonth(end.getMonth() + parseInt(renewDuration));

      const response = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membership_end: end.toISOString().split('T')[0],
        }),
      });

      if (response.ok) {
        await fetchMember();
        setRenewOpen(false);
      }
    } catch (err) {
      alert('Failed to renew membership');
    } finally {
      setRenewLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!member) return;

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !member.is_active }),
      });

      if (response.ok) {
        await fetchMember();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const downloadQR = () => {
    if (!member) return;
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${member.name}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyQR = () => {
    if (!member) return;
    navigator.clipboard.writeText(`GYMQR:${member.qr_code}`);
    alert('QR code copied to clipboard!');
  };

  const isExpired = member
    ? new Date(member.membership_end) < new Date()
    : false;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Member Not Found</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/dashboard/members">
              <Button>Back to Members</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/members">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{member.name}</h1>
            <p className="text-muted-foreground">{member.phone}</p>
          </div>
          <Badge
            variant={isExpired ? 'destructive' : 'default'}
            className={
              !isExpired
                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                : ''
            }
          >
            {isExpired ? 'Expired' : 'Active'}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setRenewOpen(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Renew
          </Button>
          <Button
            variant={member.is_active ? 'destructive' : 'default'}
            onClick={handleToggleActive}
          >
            {member.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details Card */}
        <Card className="lg:col-span-2 border-white/10 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Member Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Phone</Label>
              <p className="font-medium">{member.phone}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <p className="font-medium">
                {member.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Membership Start</Label>
              <p className="font-medium">
                {format(new Date(member.membership_start), 'PPP')}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Membership End</Label>
              <p className="font-medium">
                {format(new Date(member.membership_end), 'PPP')}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Created At</Label>
              <p className="font-medium">
                {format(new Date(member.created_at), 'PPP')}
              </p>
            </div>
            <div className="col-span-2">
              <Label className="text-muted-foreground">Notes</Label>
              <p className="font-medium">
                {member.notes || 'No notes available'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card className="border-white/10 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCodeSVG
                id="qr-code"
                value={`GYMQR:${member.qr_code}`}
                size={200}
                level="H"
              />
            </div>
            <div className="space-y-2">
              <Button onClick={downloadQR} className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
              <Button onClick={copyQR} className="w-full" variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Card */}
      <Card className="border-white/10 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Last 30 check-ins</CardDescription>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No attendance records yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {format(new Date(record.check_in_time), 'PPP')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(record.check_in_time), 'p')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>Update member information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} />
              {editErrors.name && (
                <p className="text-sm text-destructive mt-1">
                  {editErrors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} maxLength={10} />
              {editErrors.phone && (
                <p className="text-sm text-destructive mt-1">
                  {editErrors.phone.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Renew Modal */}
      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Membership</DialogTitle>
            <DialogDescription>
              Extend membership from current end date
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Duration</Label>
              <Select value={renewDuration} onValueChange={setRenewDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Month</SelectItem>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold">New End Date:</span>{' '}
                {(() => {
                  const end = new Date(member.membership_end);
                  end.setMonth(end.getMonth() + parseInt(renewDuration));
                  return format(end, 'PPP');
                })()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenew} disabled={renewLoading}>
              {renewLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Renewing...
                </>
              ) : (
                'Renew Membership'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
