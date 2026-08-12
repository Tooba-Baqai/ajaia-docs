import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';

export const metadata: Metadata = {
  title: 'Ajaia Docs - Collaborative Document Workspace',
  description:
    'A lightweight, responsive collaborative document editor inspired by Google Docs, built with TipTap, Next.js, and SQLite.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-docbg-canvas dark:bg-docbg-canvasDark text-gray-900 dark:text-gray-100 min-h-screen flex flex-col antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
