import { create } from 'zustand'

export interface NavigationState {
  // Sidebar state
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  
  // Mobile state
  isMobile: boolean
  mobileMenuOpen: boolean
  
  // Current page state
  currentPage: string
  pageTitle: string
  breadcrumbs: Array<{
    label: string
    href?: string
  }>
  
  // Dashboard tab state (for single-page dashboard navigation)
  activeTab: string
  dashboardMode: boolean // true = single-page dashboard, false = multi-page routing
  
  // Actions
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  toggleSidebarCollapsed: () => void
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  setIsMobile: (isMobile: boolean) => void
  setCurrentPage: (page: string, title: string, breadcrumbs?: Array<{label: string, href?: string}>) => void
  closeMobileMenu: () => void
  
  // Dashboard tab actions
  setActiveTab: (tab: string) => void
  setDashboardMode: (enabled: boolean) => void
}

export const useNavigationStore = create<NavigationState>()((set, get) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      isMobile: false,
      mobileMenuOpen: false,
      currentPage: '',
      pageTitle: '',
      breadcrumbs: [],
      activeTab: 'overview', // Default to overview tab
      dashboardMode: true, // Enable single-page dashboard by default

      // Sidebar actions
      setSidebarOpen: (open) => 
        set((state) => ({ 
          sidebarOpen: open,
          // Close mobile menu when opening sidebar on mobile
          mobileMenuOpen: state.isMobile ? false : state.mobileMenuOpen 
        })),

      setSidebarCollapsed: (collapsed) => 
        set(() => ({ sidebarCollapsed: collapsed })),

      toggleSidebar: () => 
        set((state) => ({ 
          sidebarOpen: !state.sidebarOpen,
          // Close mobile menu when toggling sidebar on mobile
          mobileMenuOpen: state.isMobile ? false : state.mobileMenuOpen
        })),

      toggleSidebarCollapsed: () => 
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Mobile actions
      setMobileMenuOpen: (open) => 
        set(() => ({ mobileMenuOpen: open })),

      toggleMobileMenu: () => 
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

      setIsMobile: (isMobile) => 
        set((state) => ({
          isMobile,
          // Reset mobile menu when switching between mobile/desktop
          mobileMenuOpen: false,
          // Adjust sidebar state based on screen size
          sidebarOpen: isMobile ? false : state.sidebarOpen,
        })),

      // Page state actions
      setCurrentPage: (page, title, breadcrumbs = []) =>
        set(() => ({
          currentPage: page,
          pageTitle: title,
          breadcrumbs: [
            { label: 'Home', href: '/dashboard' },
            ...breadcrumbs
          ]
        })),

      closeMobileMenu: () => 
        set(() => ({ mobileMenuOpen: false })),

      // Dashboard tab actions
      setActiveTab: (tab) => 
        set(() => ({ activeTab: tab })),

      setDashboardMode: (enabled) => 
        set(() => ({ dashboardMode: enabled })),
}))

// Navigation items configuration
export interface NavigationItem {
  key: string
  label: string
  href: string
  icon: string
  badge?: string | number
  description?: string
  children?: NavigationItem[]
}

// Dashboard tab configuration (for single-page dashboard)
export interface DashboardTab {
  key: string
  label: string
  icon: string
  description?: string
  badge?: string | number
}

export const dashboardTabs: DashboardTab[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: 'LayoutDashboard',
    description: 'Financial overview and insights'
  },
  {
    key: 'transactions',
    label: 'Transactions',
    icon: 'Receipt',
    description: 'Manage income and expenses'
  },
  {
    key: 'categories',
    label: 'Categories',
    icon: 'Tags',
    description: 'Organize transaction types'
  },
  {
    key: 'targets',
    label: 'Budget Targets',
    icon: 'Target',
    description: 'Set and track spending goals'
  },
  {
    key: 'goals',
    label: 'Saving Goals',
    icon: 'Piggybank',
    description: 'Track your savings progress'
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    icon: 'BarChart3',
    description: 'Detailed financial analysis'
  }
]

export const navigationItems: NavigationItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    description: 'Financial overview and insights'
  },
  {
    key: 'transactions',
    label: 'Transactions',
    href: '/transactions',
    icon: 'Receipt',
    description: 'Manage income and expenses'
  },
  {
    key: 'categories',
    label: 'Categories',
    href: '/categories',
    icon: 'Tags',
    description: 'Organize transaction types'
  },
  {
    key: 'targets',
    label: 'Budget Targets',
    href: '/targets',
    icon: 'Target',
    description: 'Set and track spending goals'
  },
  {
    key: 'goals',
    label: 'Saving Goals',
    href: '/goals',
    icon: 'Piggybank',
    description: 'Track your savings progress'
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    href: '/reports',
    icon: 'BarChart3',
    description: 'Detailed financial analysis'
  },
  {
    key: 'achievements',
    label: 'Achievements',
    href: '/achievements',
    icon: 'Trophy',
    description: 'Track your financial milestones'
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
    description: 'Account and app preferences'
  }
]

// Helper hook for current navigation item
export const useCurrentNavigationItem = () => {
  const currentPage = useNavigationStore((state) => state.currentPage)
  
  const findCurrentItem = (items: NavigationItem[]): NavigationItem | undefined => {
    for (const item of items) {
      if (item.key === currentPage) {
        return item
      }
      if (item.children) {
        const found = findCurrentItem(item.children)
        if (found) return found
      }
    }
    return undefined
  }
  
  return findCurrentItem(navigationItems)
}