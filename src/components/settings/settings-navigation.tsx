'use client'

import { 
  User, 
  DollarSign, 
  Shield, 
  Lock, 
  Bell, 
  Palette, 
  Database,
  Settings as SettingsIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SettingsTab } from './settings-content'

interface SettingsNavigationProps {
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
}

const navigationItems = [
  {
    id: 'profile' as const,
    label: 'Profile',
    description: 'Personal information and avatar',
    icon: User,
    color: 'text-primary'
  },
  {
    id: 'financial' as const,
    label: 'Financial',
    description: 'Currency and fiscal preferences',
    icon: DollarSign,
    color: 'text-income'
  },
  {
    id: 'privacy' as const,
    label: 'Privacy',
    description: 'Data visibility and sharing',
    icon: Shield,
    color: 'text-secondary'
  },
  {
    id: 'security' as const,
    label: 'Security',
    description: 'Password and authentication',
    icon: Lock,
    color: 'text-destructive'
  },
  {
    id: 'notifications' as const,
    label: 'Notifications',
    description: 'Email and in-app alerts',
    icon: Bell,
    color: 'text-warning'
  },
  {
    id: 'appearance' as const,
    label: 'Appearance',
    description: 'Theme and dashboard layout',
    icon: Palette,
    color: 'text-info'
  },
  {
    id: 'data' as const,
    label: 'Data Management',
    description: 'Export, backup, and deletion',
    icon: Database,
    color: 'text-muted-foreground'
  }
]

export function SettingsNavigation({ activeTab, onTabChange }: SettingsNavigationProps) {
  return (
    <>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <SettingsIcon className="h-5 w-5 text-primary" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {navigationItems.map((item, index) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200',
                'hover:bg-accent/50 hover:shadow-sm group',
                isActive ? 'bg-primary/10 shadow-sm border-l-2 border-primary' : 'hover:bg-accent/30'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon 
                className={cn(
                  'h-4 w-4 mt-0.5 transition-colors',
                  isActive ? 'text-primary' : item.color,
                  'group-hover:scale-110 transition-transform'
                )} 
              />
              <div className="flex-1 text-left">
                <div className={cn(
                  'font-medium text-sm transition-colors',
                  isActive ? 'text-primary' : 'text-foreground'
                )}>
                  {item.label}
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </div>
              </div>
            </button>
          )
        })}
      </CardContent>
    </>
  )
}