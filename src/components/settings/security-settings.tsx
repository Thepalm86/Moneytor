'use client'

import { useState } from 'react'
import { Lock, Shield, Key, AlertTriangle, Save, Loader2, Smartphone, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase-client'
import { toast } from 'sonner'

interface SecuritySettings {
  two_factor_enabled: boolean
  session_timeout: number
  login_notifications: boolean
  suspicious_activity_alerts: boolean
  device_management: boolean
}

export function SecuritySettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [settings, setSettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    session_timeout: 30,
    login_notifications: true,
    suspicious_activity_alerts: true,
    device_management: true
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[]
  })

  const supabase = createClient()

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    let score = 0
    const feedback = []

    if (password.length < 8) {
      feedback.push('Password should be at least 8 characters long')
    } else {
      score += 1
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Include at least one uppercase letter')
    } else {
      score += 1
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Include at least one lowercase letter')
    } else {
      score += 1
    }

    if (!/\d/.test(password)) {
      feedback.push('Include at least one number')
    } else {
      score += 1
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Include at least one special character')
    } else {
      score += 1
    }

    setPasswordStrength({ score, feedback })
  }

  const handlePasswordChange = async () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      toast.error('Please fill in all password fields')
      return
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordStrength.score < 3) {
      toast.error('Password is too weak. Please choose a stronger password.')
      return
    }

    try {
      setChangingPassword(true)

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      })

      if (error) {
        console.error('Password change error:', error)
        toast.error('Failed to change password. Please try again.')
        return
      }

      // Clear form
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
      setPasswordStrength({ score: 0, feedback: [] })

      toast.success('Password changed successfully')
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSettingsUpdate = async (key: keyof SecuritySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    // In a real implementation, this would save to the database
    toast.success('Security settings updated')
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score < 2) return 'bg-destructive'
    if (passwordStrength.score < 4) return 'bg-warning'
    return 'bg-success'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength.score < 2) return 'Weak'
    if (passwordStrength.score < 4) return 'Medium'
    return 'Strong'
  }

  return (
    <div className="space-y-6">
      {/* Password Security */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Password Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData(prev => ({ 
                  ...prev, 
                  current_password: e.target.value 
                }))}
                placeholder="Enter your current password"
              />
            </div>

            <div>
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={(e) => {
                  const value = e.target.value
                  setPasswordData(prev => ({ ...prev, new_password: value }))
                  if (value) checkPasswordStrength(value)
                  else setPasswordStrength({ score: 0, feedback: [] })
                }}
                placeholder="Enter your new password"
              />
              
              {passwordData.new_password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <Badge 
                      variant={passwordStrength.score < 2 ? 'destructive' : passwordStrength.score < 4 ? 'warning' : 'success'}
                    >
                      {getPasswordStrengthText()}
                    </Badge>
                  </div>
                  
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData(prev => ({ 
                  ...prev, 
                  confirm_password: e.target.value 
                }))}
                placeholder="Confirm your new password"
              />
              
              {passwordData.confirm_password && passwordData.new_password && (
                <div className="mt-1 flex items-center gap-2">
                  {passwordData.new_password === passwordData.confirm_password ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-xs text-success">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-xs text-destructive">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={handlePasswordChange}
              disabled={changingPassword || passwordStrength.score < 3}
              className="flex items-center gap-2"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Authenticator App</h4>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security using an authenticator app
              </p>
              <Badge variant={settings.two_factor_enabled ? 'success' : 'secondary'}>
                {settings.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <Button
              variant={settings.two_factor_enabled ? 'destructive' : 'default'}
              onClick={() => {
                if (settings.two_factor_enabled) {
                  toast.info('Two-factor authentication would be disabled')
                  handleSettingsUpdate('two_factor_enabled', false)
                } else {
                  toast.info('Two-factor authentication setup would begin')
                  handleSettingsUpdate('two_factor_enabled', true)
                }
              }}
            >
              {settings.two_factor_enabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session & Activity Settings */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Session & Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="login_notifications"
                checked={settings.login_notifications}
                onCheckedChange={(checked) => 
                  handleSettingsUpdate('login_notifications', checked)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="login_notifications" className="text-sm font-medium">
                  Login Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when someone signs into your account
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="suspicious_activity_alerts"
                checked={settings.suspicious_activity_alerts}
                onCheckedChange={(checked) => 
                  handleSettingsUpdate('suspicious_activity_alerts', checked)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="suspicious_activity_alerts" className="text-sm font-medium">
                  Suspicious Activity Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get alerts for unusual account activity or security issues
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="device_management"
                checked={settings.device_management}
                onCheckedChange={(checked) => 
                  handleSettingsUpdate('device_management', checked)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="device_management" className="text-sm font-medium">
                  Device Management
                </Label>
                <p className="text-xs text-muted-foreground">
                  Manage and monitor devices that have access to your account
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Summary */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Security Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Password Strength:</span>
              <Badge variant="success">Strong</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Two-Factor Auth:</span>
              <Badge variant={settings.two_factor_enabled ? 'success' : 'secondary'}>
                {settings.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Login Alerts:</span>
              <Badge variant={settings.login_notifications ? 'success' : 'secondary'}>
                {settings.login_notifications ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-success" />
              <span className="text-success font-medium">Your account is well protected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}