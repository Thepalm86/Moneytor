'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Receipt,
  Tags,
  Target,
  PiggyBank,
  BarChart3,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useNavigationStore, navigationItems, dashboardTabs } from '@/lib/stores/navigation-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Icon mapping
const iconMap = {
  LayoutDashboard,
  Receipt,
  Tags,
  Target,
  Piggybank: PiggyBank,
  BarChart3,
  Trophy,
  Settings,
  User,
  LogOut
}

interface SidebarProps {
  className?: string
}

interface SidebarItemProps {
  item: typeof navigationItems[0]
  isActive: boolean
  collapsed: boolean
  onNavigate: () => void
}

interface DashboardTabItemProps {
  tab: typeof dashboardTabs[0]
  isActive: boolean
  collapsed: boolean
  onNavigate: () => void
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  item, 
  isActive, 
  collapsed, 
  onNavigate 
}) => {
  const IconComponent = iconMap[item.icon as keyof typeof iconMap]

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent/50',
        isActive
          ? 'bg-primary/10 text-primary shadow-sm hover:bg-primary/15'
          : 'text-muted-foreground hover:text-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      {IconComponent && (
        <IconComponent
          className={cn(
            'h-5 w-5 flex-shrink-0 transition-colors',
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          )}
        />
      )}
      
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className="h-5 px-1.5 text-xs"
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 group-hover:block">
          <div className="rounded-lg bg-popover px-3 py-2 shadow-lg border">
            <p className="text-sm font-medium">{item.label}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {item.description}
              </p>
            )}
          </div>
        </div>
      )}
    </Link>
  )
}

const DashboardTabItem: React.FC<DashboardTabItemProps> = ({ 
  tab, 
  isActive, 
  collapsed, 
  onNavigate 
}) => {
  const { setActiveTab } = useNavigationStore()
  const IconComponent = iconMap[tab.icon as keyof typeof iconMap]

  const handleClick = () => {
    setActiveTab(tab.key)
    onNavigate()
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent/50 w-full text-left',
        isActive
          ? 'bg-primary/10 text-primary shadow-sm hover:bg-primary/15'
          : 'text-muted-foreground hover:text-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      {IconComponent && (
        <IconComponent
          className={cn(
            'h-5 w-5 flex-shrink-0 transition-colors',
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          )}
        />
      )}
      
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{tab.label}</span>
          {tab.badge && (
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className="h-5 px-1.5 text-xs"
            >
              {tab.badge}
            </Badge>
          )}
        </>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 group-hover:block">
          <div className="rounded-lg bg-popover px-3 py-2 shadow-lg border">
            <p className="text-sm font-medium">{tab.label}</p>
            {tab.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {tab.description}
              </p>
            )}
          </div>
        </div>
      )}
    </button>
  )
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname()
  const {
    sidebarOpen,
    sidebarCollapsed,
    isMobile,
    mobileMenuOpen,
    toggleSidebar,
    toggleSidebarCollapsed,
    setMobileMenuOpen,
    closeMobileMenu,
    activeTab,
    dashboardMode,
    isHydrated,
  } = useNavigationStore()

  // Check if we're in the dashboard
  const isDashboard = pathname === '/dashboard'

  // Handle mobile responsiveness
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      useNavigationStore.getState().setIsMobile(mobile)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile menu on route change
  React.useEffect(() => {
    closeMobileMenu()
  }, [pathname, closeMobileMenu])

  // Don't render sidebar on mobile when closed
  if (isMobile && !mobileMenuOpen) {
    return null
  }

  const handleNavigate = () => {
    if (isMobile) {
      closeMobileMenu()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-card border-r border-border transition-all duration-300 ease-in-out',
          // Width management
          sidebarCollapsed && !isMobile
            ? 'w-16'
            : isMobile
            ? 'w-80'
            : 'w-64',
          // Mobile positioning
          isMobile && !mobileMenuOpen && '-translate-x-full',
          // Desktop show/hide
          !isMobile && !sidebarOpen && '-translate-x-full',
          className
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                Moneytor
              </span>
            </div>
          )}

          <div className="flex items-center gap-1">
            {/* Desktop collapse toggle */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSidebarCollapsed}
                className="h-8 w-8"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Mobile close button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <nav className="space-y-1">
            {isDashboard && dashboardMode && isHydrated ? (
              // Dashboard tab navigation (only when hydrated)
              dashboardTabs.map((tab) => {
                const isActive = activeTab === tab.key
                
                return (
                  <DashboardTabItem
                    key={tab.key}
                    tab={tab}
                    isActive={isActive}
                    collapsed={sidebarCollapsed && !isMobile}
                    onNavigate={handleNavigate}
                  />
                )
              })
            ) : (
              // Regular page navigation (fallback and non-dashboard pages)
              navigationItems.map((item) => {
                const isActive = pathname === item.href
                
                return (
                  <SidebarItem
                    key={item.key}
                    item={item}
                    isActive={isActive}
                    collapsed={sidebarCollapsed && !isMobile}
                    onNavigate={handleNavigate}
                  />
                )
              })
            )}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <Separator className="mb-3" />
          
          {/* User section - will be populated with actual user data later */}
          <div className="space-y-1">
            <Link
              href="/settings/profile"
              onClick={handleNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground',
                sidebarCollapsed && !isMobile && 'justify-center px-2'
              )}
            >
              <User className="h-4 w-4 flex-shrink-0" />
              {(!sidebarCollapsed || isMobile) && <span>Profile</span>}
            </Link>

            <button
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground',
                sidebarCollapsed && !isMobile && 'justify-center px-2'
              )}
              onClick={() => {
                // TODO: Implement logout functionality
                console.log('Logout clicked')
              }}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {(!sidebarCollapsed || isMobile) && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Mobile menu trigger button
interface MobileMenuButtonProps {
  className?: string
}

export const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ 
  className 
}) => {
  const { mobileMenuOpen, toggleMobileMenu, isMobile } = useNavigationStore()

  if (!isMobile) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMobileMenu}
      className={cn('lg:hidden', className)}
    >
      {mobileMenuOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  )
}

export default Sidebar