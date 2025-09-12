'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  className?: string
}

interface UserProfileProps {
  user?: {
    name?: string
    email?: string
    avatar?: string
    initials?: string
  }
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { user: authUser, signOut } = useAuth()
  
  const defaultUser = {
    name: 'User',
    email: authUser?.email || 'user@example.com',
    initials: authUser?.email ? authUser.email.substring(0, 2).toUpperCase() : 'U',
    avatar: undefined
  }

  const currentUser = user || defaultUser

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:bg-accent/50"
        >
          <Avatar className="h-9 w-9">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-medium">
                {currentUser.initials}
              </div>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {currentUser.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Account Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const NotificationButton: React.FC = () => {
  const [hasNotifications] = React.useState(true) // Mock notification state
  const [notificationCount] = React.useState(3) // Mock count

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent/50"
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <span>Notifications</span>
            <Badge variant="secondary" className="h-5 px-2">
              {notificationCount}
            </Badge>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Mock notifications */}
        <DropdownMenuItem className="cursor-pointer p-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Budget Alert</p>
            <p className="text-xs text-muted-foreground">
              You&apos;ve spent 80% of your monthly grocery budget
            </p>
            <p className="text-xs text-muted-foreground">2 hours ago</p>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer p-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Goal Milestone</p>
            <p className="text-xs text-muted-foreground">
              You&apos;re halfway to your vacation savings goal!
            </p>
            <p className="text-xs text-muted-foreground">1 day ago</p>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer p-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Achievement Unlocked</p>
            <p className="text-xs text-muted-foreground">
              You&apos;ve logged transactions for 30 days straight!
            </p>
            <p className="text-xs text-muted-foreground">3 days ago</p>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer text-center text-primary">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-accent/50"
      >
        <div className="h-5 w-5" />
        <span className="sr-only">Loading theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent/50"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
          <Sun className="mr-2 h-4 w-4" />
          Light
          {theme === 'light' && (
            <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
          <Moon className="mr-2 h-4 w-4" />
          Dark
          {theme === 'dark' && (
            <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer">
          <Monitor className="mr-2 h-4 w-4" />
          System
          {theme === 'system' && (
            <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isFocused, setIsFocused] = React.useState(false)

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search transactions, categories..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'pl-9 pr-4 transition-all duration-200',
          isFocused && 'ring-2 ring-primary/20'
        )}
      />
      
      {/* Search results dropdown would go here */}
      {searchQuery && isFocused && (
        <div className="absolute top-full mt-1 w-full rounded-lg bg-popover border shadow-lg z-50 p-2">
          <p className="text-sm text-muted-foreground text-center py-4">
            Search functionality coming soon...
          </p>
        </div>
      )}
    </div>
  )
}

const MobileMenuButton: React.FC = () => {
  const [isMobile, setIsMobile] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isMobile) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="hover:bg-accent/50 lg:hidden"
    >
      {mobileMenuOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  )
}

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname()
  
  // Generate breadcrumbs from URL path
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    
    if (segments.length === 0) return []
    
    const breadcrumbs = segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const label = segment.charAt(0).toUpperCase() + segment.slice(1)
      return { label, href }
    })
    
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()
  
  if (breadcrumbs.length <= 1) {
    return null // Don't show breadcrumbs for root or single level
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span>/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <a
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </a>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Calculate left margin - simplified
  const getMarginLeft = () => {
    if (isMobile) return '0px'
    return '256px' // Standard sidebar width
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6 transition-all duration-300',
        className
      )}
      style={{
        marginLeft: getMarginLeft(),
      }}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        <MobileMenuButton />
        <Breadcrumbs />
      </div>

      {/* Center section - Search */}
      <div className="hidden md:flex flex-1 justify-center px-6">
        <SearchBar />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-accent/50"
        >
          <Search className="h-5 w-5" />
        </Button>

        <ThemeToggle />
        <NotificationButton />
        <UserProfile />
      </div>
    </header>
  )
}

export default Header