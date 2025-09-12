'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { 
  Heart, 
  Star, 
  TrendingUp, 
  DollarSign, 
  PiggyBank,
  CreditCard,
  Target,
  Award,
  Plus,
  Minus
} from 'lucide-react'

export default function DesignShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Moneytor Design System
          </h1>
          <p className="text-lg text-muted-foreground">
            Premium pastel UI components for modern financial applications
          </p>
        </div>

        {/* Color Palette */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Pastel Color Palette
            </CardTitle>
            <CardDescription>
              Soft, sophisticated colors designed for premium financial interfaces
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-primary shadow-md"></div>
              <p className="text-sm font-medium">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-secondary shadow-md"></div>
              <p className="text-sm font-medium">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-income shadow-md"></div>
              <p className="text-sm font-medium">Income</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-expense shadow-md"></div>
              <p className="text-sm font-medium">Expense</p>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>Premium button components with smooth animations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Primary Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="gradient">Gradient</Button>
                <Button variant="premium">Premium</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Financial Actions</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="income" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Income
                </Button>
                <Button variant="expense" className="gap-2">
                  <Minus className="h-4 w-4" />
                  Add Expense
                </Button>
                <Button variant="savings" className="gap-2">
                  <PiggyBank className="h-4 w-4" />
                  Save Money
                </Button>
              </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Status & Actions</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="destructive">Delete</Button>
                <Button variant="info">Info</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Badge Components</CardTitle>
            <CardDescription>Status indicators and labels with premium styling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="income">+{formatCurrency(1500)}</Badge>
              <Badge variant="expense">-{formatCurrency(890)}</Badge>
              <Badge variant="savings">Saved</Badge>
              <Badge variant="success">Completed</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="gradient">Premium</Badge>
              <Badge variant="soft">Draft</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Financial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-income/20 bg-gradient-to-br from-income/5 to-income/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-income" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-income">
                {formatCurrency(15750)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="success" size="sm">+12.5%</Badge>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-expense/20 bg-gradient-to-br from-expense/5 to-expense/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-expense" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">
                {formatCurrency(8920)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="warning" size="sm">+5.2%</Badge>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-savings/20 bg-gradient-to-br from-savings/5 to-savings/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-savings" />
                Savings Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-savings">
                {formatCurrency(25000)}
              </div>
              <div className="mt-3">
                <Progress value={68} variant="savings" className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>68% complete</span>
                  <span>{formatCurrency(17000)} saved</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Input Components */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
            <CardDescription>Form inputs with premium styling and icons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount" 
                  placeholder="Enter amount..." 
                  startIcon={<DollarSign className="h-4 w-4" />} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  placeholder="Select category..." 
                  endIcon={<Target className="h-4 w-4" />} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avatar & User Info */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>User Components</CardTitle>
            <CardDescription>Avatar and user information display</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">John Doe</h3>
                <p className="text-sm text-muted-foreground">Premium Member</p>
                <div className="flex items-center gap-2">
                  <Badge variant="gradient" size="sm">
                    <Award className="h-3 w-3 mr-1" />
                    Gold Status
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}