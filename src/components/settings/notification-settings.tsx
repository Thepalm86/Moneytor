'use client'

import { useState } from 'react'
import { Bell, Mail, Smartphone, Save, Loader2, DollarSign, Target, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface NotificationPreferences {
  email_notifications: {
    transaction_summaries: boolean
    budget_alerts: boolean
    goal_achievements: boolean
    security_alerts: boolean
    weekly_reports: boolean
    monthly_reports: boolean
  }
  push_notifications: {
    budget_warnings: boolean
    goal_milestones: boolean
    transaction_alerts: boolean
    achievement_unlocked: boolean
    daily_reminders: boolean
  }
  notification_frequency: 'immediate' | 'daily' | 'weekly'
  quiet_hours: {
    enabled: boolean
    start_time: string
    end_time: string
  }
}

const frequencyOptions = [
  { value: 'immediate', label: 'Immediate', description: 'Get notified right away' },
  { value: 'daily', label: 'Daily Digest', description: 'Once per day summary' },
  { value: 'weekly', label: 'Weekly Summary', description: 'Weekly roundup only' }
]

export function NotificationSettings() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: {
      transaction_summaries: true,
      budget_alerts: true,
      goal_achievements: true,
      security_alerts: true,
      weekly_reports: true,
      monthly_reports: false
    },
    push_notifications: {
      budget_warnings: true,
      goal_milestones: true,
      transaction_alerts: false,
      achievement_unlocked: true,
      daily_reminders: false
    },
    notification_frequency: 'daily',
    quiet_hours: {
      enabled: true,
      start_time: '22:00',
      end_time: '07:00'
    }
  })

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Simulate saving preferences
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Notification preferences updated successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save notification preferences')
    } finally {
      setSaving(false)
    }
  }

  const updateEmailPreference = (key: keyof typeof preferences.email_notifications, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      email_notifications: { ...prev.email_notifications, [key]: value }
    }))
  }

  const updatePushPreference = (key: keyof typeof preferences.push_notifications, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      push_notifications: { ...prev.push_notifications, [key]: value }
    }))
  }

  const updateQuietHours = (key: keyof typeof preferences.quiet_hours, value: any) => {
    setPreferences(prev => ({
      ...prev,
      quiet_hours: { ...prev.quiet_hours, [key]: value }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="transaction_summaries"
                checked={preferences.email_notifications.transaction_summaries}
                onCheckedChange={(checked) => 
                  updateEmailPreference('transaction_summaries', checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="transaction_summaries" className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Transaction Summaries
                </Label>
                <p className="text-xs text-muted-foreground">
                  Daily or weekly summaries of your transactions and spending
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="budget_alerts"
                checked={preferences.email_notifications.budget_alerts}
                onCheckedChange={(checked) => 
                  updateEmailPreference('budget_alerts', checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="budget_alerts" className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Budget Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Alerts when you&apos;re approaching or exceeding budget limits
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="goal_achievements"
                checked={preferences.email_notifications.goal_achievements}
                onCheckedChange={(checked) => 
                  updateEmailPreference('goal_achievements', checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="goal_achievements" className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Goal Achievements
                </Label>
                <p className="text-xs text-muted-foreground">
                  Celebrate when you reach savings goals and milestones
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="weekly_reports"
                checked={preferences.email_notifications.weekly_reports}
                onCheckedChange={(checked) => 
                  updateEmailPreference('weekly_reports', checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="weekly_reports" className="text-sm font-medium">
                  Weekly Reports
                </Label>
                <p className="text-xs text-muted-foreground">
                  Comprehensive weekly financial summary and insights
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="monthly_reports"
                checked={preferences.email_notifications.monthly_reports}
                onCheckedChange={(checked) => 
                  updateEmailPreference('monthly_reports', checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="monthly_reports" className="text-sm font-medium">
                  Monthly Reports
                </Label>
                <p className="text-xs text-muted-foreground">
                  Detailed monthly analysis and financial trends
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="security_alerts"
                checked={preferences.email_notifications.security_alerts}
                onCheckedChange={(checked) => 
                  updateEmailPreference('security_alerts', checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="security_alerts" className="text-sm font-medium">
                  Security Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Important security notifications and login alerts (recommended)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            In-App Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="budget_warnings"
                checked={preferences.push_notifications.budget_warnings}
                onCheckedChange={(checked) => 
                  updatePushPreference('budget_warnings', checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="budget_warnings" className="text-sm font-medium">
                  Budget Warnings
                </Label>
                <p className="text-xs text-muted-foreground">
                  Real-time alerts when approaching budget limits
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="goal_milestones"
                checked={preferences.push_notifications.goal_milestones}
                onCheckedChange={(checked) => 
                  updatePushPreference('goal_milestones', checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="goal_milestones" className="text-sm font-medium">
                  Goal Milestones
                </Label>
                <p className="text-xs text-muted-foreground">
                  Celebrate progress on your savings goals
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="achievement_unlocked"
                checked={preferences.push_notifications.achievement_unlocked}
                onCheckedChange={(checked) => 
                  updatePushPreference('achievement_unlocked', checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="achievement_unlocked" className="text-sm font-medium">
                  Achievement Unlocked
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when you earn new achievements
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="transaction_alerts"
                checked={preferences.push_notifications.transaction_alerts}
                onCheckedChange={(checked) => 
                  updatePushPreference('transaction_alerts', checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="transaction_alerts" className="text-sm font-medium">
                  Transaction Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Notifications for all new transactions
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="daily_reminders"
                checked={preferences.push_notifications.daily_reminders}
                onCheckedChange={(checked) => 
                  updatePushPreference('daily_reminders', checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="daily_reminders" className="text-sm font-medium">
                  Daily Reminders
                </Label>
                <p className="text-xs text-muted-foreground">
                  Gentle reminders to track your daily expenses
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Timing */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Notification Frequency</Label>
              <Select
                value={preferences.notification_frequency}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, notification_frequency: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="quiet_hours_enabled"
                  checked={preferences.quiet_hours.enabled}
                  onCheckedChange={(checked) => 
                    updateQuietHours('enabled', checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="quiet_hours_enabled" className="text-sm font-medium">
                    Enable Quiet Hours
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Pause non-urgent notifications during specified hours
                  </p>
                </div>
              </div>

              {preferences.quiet_hours.enabled && (
                <div className="ml-6 grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiet_start">Start Time</Label>
                    <input
                      id="quiet_start"
                      type="time"
                      value={preferences.quiet_hours.start_time}
                      onChange={(e) => updateQuietHours('start_time', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet_end">End Time</Label>
                    <input
                      id="quiet_end"
                      type="time"
                      value={preferences.quiet_hours.end_time}
                      onChange={(e) => updateQuietHours('end_time', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Summary */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Notification Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Email Frequency:</span>
              <span className="font-medium capitalize">{preferences.notification_frequency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Quiet Hours:</span>
              <span className="font-medium">
                {preferences.quiet_hours.enabled 
                  ? `${preferences.quiet_hours.start_time} - ${preferences.quiet_hours.end_time}`
                  : 'Disabled'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Email Notifications:</span>
              <span className="font-medium">
                {Object.values(preferences.email_notifications).filter(Boolean).length}/6
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Push Notifications:</span>
              <span className="font-medium">
                {Object.values(preferences.push_notifications).filter(Boolean).length}/5
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
              Save Notification Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}