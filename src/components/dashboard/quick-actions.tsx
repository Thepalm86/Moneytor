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
      <Card className={`
        p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group
        bg-white/60 backdrop-blur-sm hover:scale-[1.02] ${color.hover}
      `}>
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl ${color.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className={`h-6 w-6 ${color.icon}`} />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {title}
            </h4>
            <p className="text-sm text-slate-600 mt-1">
              {description}
            </p>
          </div>

          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
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
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      hover: 'hover:bg-blue-50/50'
    }
  },
  {
    title: 'View Transactions',
    description: 'Browse and manage all transactions',
    href: '/transactions',
    icon: Receipt,
    color: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      hover: 'hover:bg-emerald-50/50'
    }
  },
  {
    title: 'Create Budget',
    description: 'Set spending limits and targets',
    href: '/targets?action=add',
    icon: Target,
    color: {
      bg: 'bg-violet-50',
      icon: 'text-violet-600',
      hover: 'hover:bg-violet-50/50'
    }
  },
  {
    title: 'New Saving Goal',
    description: 'Set up a new financial goal',
    href: '/goals?action=add',
    icon: PiggyBank,
    color: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      hover: 'hover:bg-amber-50/50'
    }
  },
  {
    title: 'Manage Categories',
    description: 'Organize your transaction types',
    href: '/categories',
    icon: Folder,
    color: {
      bg: 'bg-pink-50',
      icon: 'text-pink-600',
      hover: 'hover:bg-pink-50/50'
    }
  },
  {
    title: 'View Reports',
    description: 'Analyze your financial trends',
    href: '/reports',
    icon: BarChart3,
    color: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      hover: 'hover:bg-indigo-50/50'
    }
  }
]

export function QuickActions() {
  return (
    <Card className="p-6 bg-white/60 backdrop-blur-sm">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
        </div>
        
        <p className="text-sm text-slate-600 -mt-4">
          Common tasks and shortcuts to get things done faster
        </p>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              description={action.description}
              href={action.href}
              icon={action.icon}
              color={action.color}
            />
          ))}
        </div>

        {/* Additional Quick Links */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            <Link href="/achievements">
              <Button variant="outline" size="sm" className="text-xs">
                🏆 Achievements
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" size="sm" className="text-xs">
                ⚙️ Settings
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="text-xs" disabled>
              📊 Export Data
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}