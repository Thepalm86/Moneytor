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
      {/* Enhanced ambient lighting effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      
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
          paddingTop: '64px', // Standard header height
        }}
      >
        {/* Page Content Container */}
        <div className="container mx-auto px-4 lg:px-6 pt-4 pb-8 scrollbar-premium overflow-x-hidden">
          <div className="animate-slide-up">
            {children}
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
    <div className={cn('space-y-4', className)}>
      {/* Premium Page Header */}
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-in mb-6">
          <div className="space-y-1">
            {title && (
              <h1 className="text-2xl font-bold text-display text-gradient leading-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-body-premium text-muted-foreground/90 max-w-2xl text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-3 animate-scale-in">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Premium Page Content */}
      <div className="space-y-4">
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            {title && (
              <h2 className="text-xl font-semibold text-display text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-body-premium text-muted-foreground/80 max-w-xl">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
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
    <div className={cn('text-center py-16 space-y-6 animate-in', className)}>
      {icon && (
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center text-muted-foreground/70 glass-card">
            {icon}
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-display text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground/80 text-body-premium max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  )
}

export default DashboardLayout