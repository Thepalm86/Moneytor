import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { AchievementProvider } from '@/components/achievements'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Moneytor - Personal Finance Manager',
  description: 'Track your income, expenses, budgets, and financial goals with ease.',
  keywords: ['finance', 'budget', 'money', 'tracking', 'expenses', 'income'],
  authors: [{ name: 'Moneytor Team' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className}`}>
        <AuthProvider>
          <AchievementProvider>
            {children}
            <Toaster position="bottom-right" richColors closeButton />
          </AchievementProvider>
        </AuthProvider>
      </body>
    </html>
  )
}