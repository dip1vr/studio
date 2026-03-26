import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from './providers';
import { SiteHeader } from '@/components/site-header';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Vidyarthi Vista',
  description: 'AI-Powered Mock Tests for Indian Government Exams',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
          </div>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
