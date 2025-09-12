import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { AchievementProvider } from '@/components/achievements'
import { CelebrationProvider, CelebrationAnimations } from '@/components/celebrations'
import { ThemeProvider } from '@/lib/theme-provider'
import { Toaster } from 'sonner'
import './globals.css'

// Premium Inter font - world-class typography for modern apps
const inter = Inter({ 
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: ['normal'],
  preload: true,
  fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif']
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <CelebrationProvider>
              <AchievementProvider>
                {children}
                <CelebrationAnimations />
                <Toaster position="bottom-right" richColors closeButton />
              </AchievementProvider>
            </CelebrationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}