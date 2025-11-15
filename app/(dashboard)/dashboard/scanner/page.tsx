'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  CheckCircle2,
  XCircle,
  QrCode,
  RefreshCw,
  User,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface ScanResult {
  success: boolean;
  action?: 'check-in' | 'check-out';
  message: string;
  member?: {
    id: string;
    name: string;
    phone: string;
  };
  attendance?: {
    id: string;
    check_in_time: string;
    check_out_time: string | null;
  };
  error?: string;
}

export default function ScannerPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isScanning) return;

    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(onScanSuccess, onScanError);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error('Failed to clear scanner:', error);
        });
      }
    };
  }, [isScanning]);

  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const onScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;

    setIsProcessing(true);

    // Strip GYMQR: prefix if present
    let qrCode = decodedText.trim();
    if (qrCode.startsWith('GYMQR:')) {
      qrCode = qrCode.substring(6);
    }

    // Validate UUID format
    if (!validateUUID(qrCode)) {
      toast({
        title: 'Invalid QR Code',
        description: 'The scanned QR code is not in the correct format.',
        variant: 'destructive',
      });
      setIsProcessing(false);
      return;
    }

    try {
      // Stop scanner
      if (scannerRef.current) {
        await scannerRef.current.clear();
        setIsScanning(false);
      }

      // Call attendance API
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qr_code: qrCode }),
      });

      const data: ScanResult = await response.json();

      if (data.success) {
        setScanResult(data);
        toast({
          title: data.action === 'check-in' ? 'Checked In' : 'Checked Out',
          description: data.message,
          variant: 'default',
        });
      } else {
        setScanResult(data);
        toast({
          title: 'Scan Failed',
          description: data.message || data.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Scan processing error:', error);
      setScanResult({
        success: false,
        message: 'Failed to process scan. Please try again.',
        error: 'Network error',
      });
      toast({
        title: 'Error',
        description: 'Failed to process scan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onScanError = (errorMessage: string) => {
    // Ignore common scanning errors (camera still searching)
    if (errorMessage.includes('NotFoundException')) {
      return;
    }
    console.warn('QR Scan error:', errorMessage);
  };

  const handleScanAgain = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">QR Attendance Scanner</h1>
        <p className="text-muted-foreground mt-2">
          Scan member QR codes to record check-ins and check-outs
        </p>
      </div>

      {/* Scanner or Result */}
      {isScanning ? (
        <Card className="border-white/10 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Scanner Active
            </CardTitle>
            <CardDescription>
              Position the QR code within the frame to scan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              id="qr-reader"
              className="w-full rounded-lg overflow-hidden"
              style={{
                border: '3px solid',
                borderImage: 'linear-gradient(135deg, #a855f7, #3b82f6) 1',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
              }}
            />
            {isProcessing && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 text-primary">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Processing scan...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : scanResult ? (
        <div
          className={`transition-all duration-500 ${
            scanResult.success
              ? 'animate-in fade-in slide-in-from-bottom-4'
              : 'animate-in fade-in'
          }`}
        >
          <Card
            className={`border-2 ${
              scanResult.success
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-red-500/50 bg-red-500/5'
            }`}
            style={{
              boxShadow: scanResult.success
                ? '0 0 30px rgba(34, 197, 94, 0.2)'
                : '0 0 30px rgba(239, 68, 68, 0.2)',
            }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {scanResult.success ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <span className="text-green-500">
                        {scanResult.action === 'check-in' ? 'Checked In' : 'Checked Out'}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-500" />
                      <span className="text-red-500">Scan Failed</span>
                    </>
                  )}
                </CardTitle>
                <Badge
                  variant={scanResult.success ? 'default' : 'destructive'}
                  className={
                    scanResult.success
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : ''
                  }
                >
                  {scanResult.success
                    ? scanResult.action === 'check-in'
                      ? 'Check-In'
                      : 'Check-Out'
                    : 'Error'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message */}
              <div
                className={`p-4 rounded-lg ${
                  scanResult.success ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}
              >
                <p className="text-center font-medium">{scanResult.message}</p>
              </div>

              {/* Member Details */}
              {scanResult.success && scanResult.member && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">{scanResult.member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {scanResult.member.phone}
                      </p>
                    </div>
                  </div>

                  {scanResult.attendance && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          {scanResult.action === 'check-in' ? 'Checked in at' : 'Checked out at'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            scanResult.action === 'check-in'
                              ? scanResult.attendance.check_in_time
                              : scanResult.attendance.check_out_time || ''
                          ).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Details */}
              {!scanResult.success && scanResult.error && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-500">Error Details</p>
                    <p className="text-sm text-muted-foreground">{scanResult.error}</p>
                  </div>
                </div>
              )}

              {/* Scan Again Button */}
              <Button onClick={handleScanAgain} className="w-full" size="lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                Scan Again
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Instructions */}
      <Card className="border-white/10 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-primary">1.</span>
              <span>Allow camera access when prompted by your browser</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-primary">2.</span>
              <span>Position the member's QR code within the scanning frame</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-primary">3.</span>
              <span>
                The scanner will automatically detect and process the QR code
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-primary">4.</span>
              <span>
                First scan = Check-in, Second scan = Check-out (toggle behavior)
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
