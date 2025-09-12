'use client'

import { useState, useEffect } from 'react'
import { Shield, Eye, EyeOff, Save, Loader2, Database, Users, Lock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

interface PrivacyPreferences {
  profile_visibility: 'private' | 'friends' | 'public'
  share_statistics: boolean
  data_retention: number
  marketing_emails: boolean
  analytics_tracking: boolean
  crash_reporting: boolean
  usage_analytics: boolean
}

const visibilityOptions = [
  { value: 'private', label: 'Private', description: 'Only you can see your data' },
  { value: 'friends', label: 'Friends Only', description: 'Share with connected users' },
  { value: 'public', label: 'Public', description: 'Anyone can see your public stats' }
]

const retentionOptions = [
  { value: 1, label: '1 Year' },
  { value: 2, label: '2 Years' },
  { value: 5, label: '5 Years' },
  { value: 10, label: '10 Years' },
  { value: 0, label: 'Keep Forever' }
]

export function PrivacySettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    profile_visibility: 'private',
    share_statistics: false,
    data_retention: 5,
    marketing_emails: false,
    analytics_tracking: true,
    crash_reporting: true,
    usage_analytics: true
  })

  useEffect(() => {
    // Simulate loading preferences
    // In a real implementation, this would load from a user_preferences table
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Simulate saving preferences
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Privacy settings updated successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save privacy settings')
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = (key: keyof PrivacyPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <Card variant="glass">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Loading privacy settings...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Privacy */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Profile Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Profile Visibility</Label>
              <Select
                value={preferences.profile_visibility}
                onValueChange={(value) => 
                  updatePreference('profile_visibility', value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="share_statistics"
                checked={preferences.share_statistics}
                onCheckedChange={(checked) => 
                  updatePreference('share_statistics', checked)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="share_statistics"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Share Anonymous Statistics
                </Label>
                <p className="text-xs text-muted-foreground">
                  Help improve the app by sharing anonymized usage statistics
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Data Retention Period</Label>
              <Select
                value={preferences.data_retention.toString()}
                onValueChange={(value) => 
                  updatePreference('data_retention', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  {retentionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                How long to keep your financial data. Archived data can be recovered within 30 days.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Data Processing Preferences
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="analytics_tracking"
                    checked={preferences.analytics_tracking}
                    onCheckedChange={(checked) => 
                      updatePreference('analytics_tracking', checked)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="analytics_tracking"
                      className="text-sm font-medium leading-none"
                    >
                      Analytics Tracking
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Help us understand how you use the app to improve your experience
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="crash_reporting"
                    checked={preferences.crash_reporting}
                    onCheckedChange={(checked) => 
                      updatePreference('crash_reporting', checked)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="crash_reporting"
                      className="text-sm font-medium leading-none"
                    >
                      Crash Reporting
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically send crash reports to help us fix issues
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="usage_analytics"
                    checked={preferences.usage_analytics}
                    onCheckedChange={(checked) => 
                      updatePreference('usage_analytics', checked)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="usage_analytics"
                      className="text-sm font-medium leading-none"
                    >
                      Usage Analytics
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Track feature usage to help prioritize improvements
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Communication Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing_emails"
              checked={preferences.marketing_emails}
              onCheckedChange={(checked) => 
                updatePreference('marketing_emails', checked)
              }
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="marketing_emails"
                className="text-sm font-medium leading-none"
              >
                Marketing Emails
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive emails about new features, tips, and special offers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Summary */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Privacy Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Profile Visibility:</span>
              <span className="font-medium capitalize">{preferences.profile_visibility}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Data Retention:</span>
              <span className="font-medium">
                {preferences.data_retention === 0 ? 'Forever' : `${preferences.data_retention} Years`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Analytics:</span>
              <span className="font-medium">
                {preferences.analytics_tracking ? 'Enabled' : 'Disabled'}
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
              Save Privacy Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}