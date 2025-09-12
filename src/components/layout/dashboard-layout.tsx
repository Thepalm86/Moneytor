'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useNavigationStore } from '@/lib/stores/navigation-store'
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
  const { sidebarOpen, sidebarCollapsed, isMobile } = useNavigationStore()

  // Calculate main content margin based on sidebar state
  const getMainContentMargin = () => {
    if (isMobile) return '0px'
    if (!sidebarOpen) return '0px'
    return sidebarCollapsed ? '64px' : '256px'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/50">
      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 ease-in-out',
          className
        )}
        style={{
          marginLeft: getMainContentMargin(),
          paddingTop: '64px', // Height of the header
        }}
      >
        {/* Page Content Container */}
        <div className="container mx-auto p-4 lg:p-6 space-y-6">
          {children}
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
  // Update navigation store with page information
  React.useEffect(() => {
    if (title) {
      useNavigationStore.getState().setCurrentPage(
        window.location.pathname.split('/').pop() || '',
        title
      )
    }
  }, [title])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Page Header */}
      {(title || description || actions) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
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
    sm: 'gap-3',
    md: 'gap-4 lg:gap-6',
    lg: 'gap-6 lg:gap-8',
  }

  return (
    <div className={cn('grid', colsClasses[cols], gapClasses[gap], className)}>
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
    <section className={cn('space-y-4', className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className="text-lg font-medium text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      <div>
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
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-sm">Loading...</span>
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
    <div className={cn('text-center py-12 space-y-4', className)}>
      {icon && (
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {description}
          </p>
        )}
      </div>
      
      {action && action}
    </div>
  )
}

export default DashboardLayout