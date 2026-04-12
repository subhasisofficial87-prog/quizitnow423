import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'QuizItNow — AI Study Partner for Indian Students',
  description: 'AI-powered personalized lectures, quizzes, and doubt clearing for Odia Board, CBSE & ICSE students.',
  keywords: ['quiz', 'study', 'AI', 'CBSE', 'ICSE', 'Odia Board', 'online learning', 'India'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-900 antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
