'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  className,
}) => {
  // Simple responsive layout - sidebar handles its own state
  const [isMobile, setIsMobile] = React.useState(false)
  
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Calculate main content margin - simplified
  const getMainContentMargin = () => {
    if (isMobile) return '0px'
    return '256px' // Standard sidebar width
  }

  return (
    <div className="min-h-screen gradient-background">
      {/* Luxury ambient lighting system */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/6 via-accent-violet/4 via-secondary/6 to-accent-cyan/4 pointer-events-none opacity-80" />
      <div className="fixed inset-0 bg-gradient-to-tl from-accent-emerald/3 via-transparent via-accent-rose/3 to-accent-amber/3 pointer-events-none opacity-60" />
      
      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main
        className={cn(
          'flex-1 transition-all duration-500 ease-out relative z-10',
          className
        )}
        style={{
          marginLeft: getMainContentMargin(),
          paddingTop: '48px', // Reduced to align content with sidebar tabs
        }}
      >
        {/* Enhanced Luxury Page Content Container */}
        <div className="container mx-auto px-4 lg:px-8 pt-0 pb-16 scrollbar-luxury overflow-x-hidden">
          {/* Luxury Content Background Enhancement */}
          <div className="relative">
            {/* Advanced Ambient Background Elements */}
            <div className="absolute top-0 left-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-primary/4 via-secondary/3 to-accent-violet/4 rounded-full blur-3xl opacity-60 animate-float" />
            <div className="absolute top-32 right-1/4 w-[28rem] h-[28rem] bg-gradient-to-tl from-secondary/4 via-accent-cyan/3 to-primary/4 rounded-full blur-3xl opacity-50 animate-float" style={{ animationDelay: '3s' }} />
            <div className="absolute top-64 left-1/3 w-[24rem] h-[24rem] bg-gradient-to-r from-accent-emerald/3 via-accent-indigo/3 to-accent-rose/3 rounded-full blur-3xl opacity-40 animate-float" style={{ animationDelay: '5s' }} />
            
            {/* Luxury Main Content */}
            <div className="relative animate-slide-up">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Page wrapper component for consistent page structure
interface PageWrapperProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  title,
  description,
  actions,
  className,
}) => {
  // No need to update navigation store - using URL-based navigation

  return (
    <div className={cn('space-y-6', className)}>
      {/* Enhanced Premium Page Header */}
      {(title || description || actions) && (
        <div className="relative">
          {/* Background Accent */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent rounded-3xl opacity-60" />
          
          {/* Luxury Main Header Content */}
          <div className="relative luxury-card-premium border-0 bg-gradient-surface-elevated backdrop-blur-xl p-8 shadow-luxury">
            {/* Advanced Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/15 via-accent-violet/12 to-secondary/15 rounded-full blur-2xl opacity-50" />
            <div className="absolute bottom-0 right-0 w-36 h-36 bg-gradient-to-tl from-secondary/12 via-accent-cyan/10 to-primary/12 rounded-full blur-3xl opacity-40" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gradient-to-r from-accent-emerald/8 to-accent-indigo/8 rounded-full blur-2xl opacity-30" />
            
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between animate-in">
              <div className="space-y-4 flex-1">
                {title && (
                  <div className="space-y-3">
                    <h1 className="text-4xl font-extrabold text-gradient-luxury leading-tight tracking-tight">
                      {title}
                    </h1>
                    {/* Enhanced Accent Line */}
                    <div className="h-1.5 w-20 bg-gradient-primary rounded-full shadow-md animate-shimmer" />
                  </div>
                )}
                {description && (
                  <p className="text-body-luxury text-foreground-subtle max-w-2xl text-lg leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              
              {actions && (
                <div className="flex items-center gap-4 animate-scale-in shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Premium Page Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

// Content area wrapper with standard spacing
interface ContentAreaProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export const ContentArea: React.FC<ContentAreaProps> = ({
  children,
  className,
  size = 'full',
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }

  return (
    <div className={cn('mx-auto w-full', sizeClasses[size], className)}>
      {children}
    </div>
  )
}

// Grid layout wrapper for consistent card layouts
interface GridLayoutProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
}

export const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  className,
  cols = 1,
  gap = 'md',
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6 lg:gap-8',
    lg: 'gap-8 lg:gap-12',
  }

  return (
    <div className={cn('grid auto-rows-fr', colsClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  )
}

// Section wrapper for consistent spacing between page sections
interface SectionProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  description,
  actions,
  className,
}) => {
  return (
    <section className={cn('space-y-6 animate-in', className)}>
      {(title || description || actions) && (
        <div className="relative">
          {/* Subtle Background Enhancement */}
          <div className="absolute -inset-2 bg-gradient-to-r from-muted/30 via-transparent to-muted/20 rounded-xl opacity-50" />
          
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between p-4 rounded-xl">
            <div className="space-y-2 flex-1">
              {title && (
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {title}
                  </h2>
                  {/* Subtle Accent Dot */}
                  <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full opacity-60" />
                </div>
              )}
              {description && (
                <p className="text-muted-foreground/70 max-w-xl text-sm font-medium leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            
            {actions && (
              <div className="flex items-center gap-3 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-5">
        {children}
      </div>
    </section>
  )
}

// Loading wrapper for consistent loading states
interface LoadingWrapperProps {
  children: React.ReactNode
  isLoading?: boolean
  loadingComponent?: React.ReactNode
  error?: string | null
  errorComponent?: React.ReactNode
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  children,
  isLoading = false,
  loadingComponent,
  error,
  errorComponent,
}) => {
  if (error) {
    return (
      errorComponent || (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="text-destructive text-sm font-medium">
              Something went wrong
            </div>
            <div className="text-muted-foreground text-xs">
              {error}
            </div>
          </div>
        </div>
      )
    )
  }

  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-muted-foreground animate-in">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}

// Empty state wrapper
interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  className,
}) => {
  return (
    <div className={cn('text-center py-20 space-y-8 animate-in', className)}>
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-transparent to-muted/10 rounded-2xl opacity-50" />
      
      {icon && (
        <div className="relative flex justify-center">
          {/* Icon Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-2xl scale-150 opacity-60" />
          <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-background via-background/90 to-background/80 flex items-center justify-center text-muted-foreground/80 glass-card shadow-premium">
            <div className="text-2xl">
              {icon}
            </div>
          </div>
        </div>
      )}
      
      <div className="relative space-y-4">
        <h3 className="text-2xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground/70 max-w-md mx-auto leading-relaxed font-medium">
            {description}
          </p>
        )}
      </div>
      
      {action && (
        <div className="relative pt-4">
          {action}
        </div>
      )}
    </div>
  )
}

export default DashboardLayout