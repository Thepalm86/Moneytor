'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Save, Loader2, Calendar, Globe } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase-client'
import { toast } from 'sonner'

interface FinancialPreferences {
  currency: string
  date_format: string
  fiscal_year_start: string
  default_budget_period: string
  weekly_budget_start: string
}

const currencyOptions = [
  { value: 'ILS', label: 'Israeli Shekel (₪)', symbol: '₪' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' }
]

const dateFormatOptions = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2024)' }
]

const fiscalYearOptions = [
  { value: 'january', label: 'January 1st' },
  { value: 'april', label: 'April 1st' },
  { value: 'july', label: 'July 1st' },
  { value: 'october', label: 'October 1st' }
]

const budgetPeriodOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'yearly', label: 'Yearly' }
]

const weekStartOptions = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'saturday', label: 'Saturday' }
]

export function FinancialSettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<FinancialPreferences>({
    currency: 'ILS',
    date_format: 'DD/MM/YYYY',
    fiscal_year_start: 'january',
    default_budget_period: 'monthly',
    weekly_budget_start: 'sunday'
  })

  const supabase = createClient()

  useEffect(() => {
    if (user?.id) {
      loadFinancialPreferences()
    }
  }, [user?.id])

  const loadFinancialPreferences = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      // For now, we'll store these preferences in the profiles table
      // In a more complex setup, you might create a separate user_preferences table
      const { data, error } = await supabase
        .from('profiles')
        .select('currency, theme_preference')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading financial preferences:', error)
        toast.error('Failed to load financial preferences')
        return
      }

      if (data) {
        setPreferences(prev => ({
          ...prev,
          currency: (data as any).currency || 'ILS'
          // Other preferences would come from a separate table or JSON field
        }))
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load financial preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id) return

    try {
      setSaving(true)

      // Update currency in profiles table
      const supabaseClient = supabase as any
      const { error } = await supabaseClient
        .from('profiles')
        .update({ currency: preferences.currency })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating financial preferences:', error)
        toast.error('Failed to save financial preferences')
        return
      }

      // In a full implementation, you'd also save other preferences
      // to a separate user_preferences table or JSON field

      toast.success('Financial preferences updated successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save financial preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card variant="glass">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Loading financial settings...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Currency Settings */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Currency & Regional Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Default Currency
              </Label>
              <Select
                value={preferences.currency}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will be used for all monetary displays and calculations.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select
                value={preferences.date_format}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, date_format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  {dateFormatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose how dates are displayed throughout the app.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget & Planning Settings */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Budget & Planning Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Fiscal Year Start</Label>
              <Select
                value={preferences.fiscal_year_start}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, fiscal_year_start: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fiscal year start" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYearOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                When your financial year begins for reporting and goals.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Default Budget Period</Label>
              <Select
                value={preferences.default_budget_period}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, default_budget_period: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget period" />
                </SelectTrigger>
                <SelectContent>
                  {budgetPeriodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default period when creating new budget targets.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Week Starts On</Label>
              <Select
                value={preferences.weekly_budget_start}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, weekly_budget_start: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select week start day" />
                </SelectTrigger>
                <SelectContent>
                  {weekStartOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                First day of the week for weekly budgets and reports.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sample Amount:</span>
              <span className="font-medium">
                {currencyOptions.find(c => c.value === preferences.currency)?.symbol}1,234.56
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sample Date:</span>
              <span className="font-medium">
                {preferences.date_format.replace('DD', '31').replace('MM', '12').replace('YYYY', '2024')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Financial Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}