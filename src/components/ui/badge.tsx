import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-sm',
        success:
          'border-transparent bg-success text-success-foreground hover:bg-success/80 shadow-sm',
        warning:
          'border-transparent bg-warning text-warning-foreground hover:bg-warning/80 shadow-sm',
        info:
          'border-transparent bg-info text-info-foreground hover:bg-info/80 shadow-sm',
        outline: 'text-foreground border-border hover:bg-accent shadow-sm',
        income:
          'border-transparent bg-income text-income-foreground hover:bg-income/80 shadow-sm',
        expense:
          'border-transparent bg-expense text-expense-foreground hover:bg-expense/80 shadow-sm',
        savings:
          'border-transparent bg-savings text-savings-foreground hover:bg-savings/80 shadow-sm',
        gradient:
          'border-transparent bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md',
        soft:
          'border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs rounded-md',
        lg: 'px-3 py-1 text-sm rounded-lg',
        xl: 'px-4 py-1.5 text-base rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }