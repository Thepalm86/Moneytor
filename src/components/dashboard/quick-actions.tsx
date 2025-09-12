'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Receipt, 
  Target, 
  PiggyBank, 
  Folder, 
  BarChart3,
  ArrowRight,
  Zap
} from 'lucide-react'

interface QuickActionProps {
  title: string
  description: string
  href: string
  icon: React.ElementType
  color: {
    bg: string
    icon: string
    hover: string
  }
}

const QuickAction = ({ title, description, href, icon: Icon, color }: QuickActionProps) => {
  return (
    <Link href={href} className="block">
      <Card 
        variant="interactive" 
        className="p-5 group relative overflow-hidden animate-in"
      >
        {/* Subtle gradient overlay */}
        <div className={`absolute inset-0 ${color.hover} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="relative flex items-center gap-4">
          <div className={`h-14 w-14 rounded-2xl ${color.bg} flex items-center justify-center glass-card group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-7 w-7 ${color.icon}`} />
          </div>
          
          <div className="flex-1 space-y-1">
            <h4 className="font-semibold text-display text-foreground group-hover:text-primary transition-colors duration-300">
              {title}
            </h4>
            <p className="text-sm text-body-premium text-muted-foreground/80">
              {description}
            </p>
          </div>

          <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-2 transition-all duration-300" />
        </div>
      </Card>
    </Link>
  )
}

const quickActions: QuickActionProps[] = [
  {
    title: 'Add Transaction',
    description: 'Record a new income or expense',
    href: '/transactions?action=add',
    icon: Plus,
    color: {
      bg: 'bg-primary/10',
      icon: 'text-primary',
      hover: 'bg-primary/5'
    }
  },
  {
    title: 'View Transactions',
    description: 'Browse and manage all transactions',
    href: '/transactions',
    icon: Receipt,
    color: {
      bg: 'bg-success/10',
      icon: 'text-success',
      hover: 'bg-success/5'
    }
  },
  {
    title: 'Create Budget',
    description: 'Set spending limits and targets',
    href: '/targets?action=add',
    icon: Target,
    color: {
      bg: 'bg-secondary/10',
      icon: 'text-secondary',
      hover: 'bg-secondary/5'
    }
  },
  {
    title: 'New Saving Goal',
    description: 'Set up a new financial goal',
    href: '/goals?action=add',
    icon: PiggyBank,
    color: {
      bg: 'bg-warning/10',
      icon: 'text-warning',
      hover: 'bg-warning/5'
    }
  },
  {
    title: 'Manage Categories',
    description: 'Organize your transaction types',
    href: '/categories',
    icon: Folder,
    color: {
      bg: 'bg-info/10',
      icon: 'text-info',
      hover: 'bg-info/5'
    }
  },
  {
    title: 'View Reports',
    description: 'Analyze your financial trends',
    href: '/reports',
    icon: BarChart3,
    color: {
      bg: 'bg-primary/10',
      icon: 'text-primary',
      hover: 'bg-primary/5'
    }
  }
]

export function QuickActions() {
  return (
    <Card variant="premium" className="p-8">
      <div className="space-y-8">
        {/* Premium Header */}
        <div className="space-y-3 animate-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center glass-card">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-display text-foreground">Quick Actions</h3>
          </div>
          
          <p className="text-body-premium text-muted-foreground/80 max-w-xl">
            Common tasks and shortcuts to get things done faster
          </p>
        </div>

        {/* Premium Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <div 
              key={index}
              className="animate-in"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <QuickAction
                title={action.title}
                description={action.description}
                href={action.href}
                icon={action.icon}
                color={action.color}
              />
            </div>
          ))}
        </div>

        {/* Premium Quick Links */}
        <div className="pt-6 border-t border-border/50">
          <div className="flex flex-wrap gap-3 animate-in">
            <Link href="/achievements">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-sm font-medium hover-lift glass-card bg-glass-bg"
              >
                🏆 Achievements
              </Button>
            </Link>
            <Link href="/settings">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-sm font-medium hover-lift glass-card bg-glass-bg"
              >
                ⚙️ Settings
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm font-medium glass-card bg-glass-bg opacity-60" 
              disabled
            >
              📊 Export Data
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}