import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Swole – Gym Management Software in India | QR Attendance + Member Tracking',
  description: 'Swole is India\'s most powerful gym management software with QR-based attendance, automated membership reminders, and member tracking – built for modern fitness studios.',
  keywords: [
    'gym management software',
    'gym software india',
    'qr gym attendance',
    'fitness studio software',
    'gym crm',
    'member tracking software',
    'gym membership system',
    'gym attendance system',
    'fitness center management',
    'gym automation software',
  ],
  authors: [{ name: 'Swole' }],
  creator: 'Swole',
  publisher: 'Swole',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://swole.in',
    title: 'Swole – Gym Management Software in India | QR Attendance + Member Tracking',
    description: 'Swole is India\'s most powerful gym management software with QR-based attendance, automated membership reminders, and member tracking – built for modern fitness studios.',
    siteName: 'Swole',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swole – Gym Management Software in India',
    description: 'QR-based attendance, automated membership reminders, and member tracking for Indian gyms.',
  },
  alternates: {
    canonical: 'https://swole.in',
  },
  verification: {
    // Add your verification codes when available
    // google: 'your-google-verification-code',
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
