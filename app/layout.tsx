import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://swole.in'),
  title: {
    default: 'Swole – Gym Management Software in India',
    template: '%s | Swole',
  },
  description: 'Modern gym management platform for Indian gyms with QR attendance, automated reminders, and member tracking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
