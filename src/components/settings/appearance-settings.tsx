'use client'

import { useState } from 'react'
import { Palette, Monitor, Sun, Moon, Save, Loader2, Layout, Grid, List } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface AppearancePreferences {
  theme: 'light' | 'dark' | 'system'
  color_scheme: 'default' | 'blue' | 'green' | 'purple' | 'orange'
  dashboard_layout: 'grid' | 'list' | 'compact'
  sidebar_collapsed: boolean
  show_animations: boolean
  high_contrast: boolean
  compact_mode: boolean
  font_size: 'small' | 'medium' | 'large'
}

const themeOptions = [
  { 
    value: 'light' as const, 
    label: 'Light', 
    icon: Sun,
    description: 'Clean and bright interface' 
  },
  { 
    value: 'dark' as const, 
    label: 'Dark', 
    icon: Moon,
    description: 'Easy on the eyes in low light' 
  },
  { 
    value: 'system' as const, 
    label: 'System', 
    icon: Monitor,
    description: 'Follow your device settings' 
  }
]

const colorSchemes = [
  { value: 'default', label: 'Default', color: 'from-primary to-secondary' },
  { value: 'blue', label: 'Ocean Blue', color: 'from-blue-600 to-cyan-600' },
  { value: 'green', label: 'Forest Green', color: 'from-green-600 to-teal-600' },
  { value: 'purple', label: 'Royal Purple', color: 'from-purple-600 to-pink-600' },
  { value: 'orange', label: 'Sunset Orange', color: 'from-orange-600 to-red-600' }
]

const layoutOptions = [
  { 
    value: 'grid' as const, 
    label: 'Grid View', 
    icon: Grid,
    description: 'Cards arranged in a grid layout' 
  },
  { 
    value: 'list' as const, 
    label: 'List View', 
    icon: List,
    description: 'Compact list with detailed information' 
  },
  { 
    value: 'compact' as const, 
    label: 'Compact View', 
    icon: Layout,
    description: 'Dense layout for more content' 
  }
]

const fontSizes = [
  { value: 'small', label: 'Small', description: 'More content, smaller text' },
  { value: 'medium', label: 'Medium', description: 'Balanced readability' },
  { value: 'large', label: 'Large', description: 'Better accessibility' }
]

export function AppearanceSettings() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<AppearancePreferences>({
    theme: 'system',
    color_scheme: 'default',
    dashboard_layout: 'grid',
    sidebar_collapsed: false,
    show_animations: true,
    high_contrast: false,
    compact_mode: false,
    font_size: 'medium'
  })

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Simulate saving preferences
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Appearance settings updated successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save appearance settings')
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = (key: keyof AppearancePreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Theme & Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Theme Preference</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => updatePreference('theme', option.value)}
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-200 text-left
                        ${preferences.theme === option.value 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{option.label}</span>
                        {preferences.theme === option.value && (
                          <Badge variant="default" size="sm">Active</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            <div>
              <Label>Color Scheme</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.value}
                    onClick={() => updatePreference('color_scheme', scheme.value)}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200 text-left
                      ${preferences.color_scheme === scheme.value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${scheme.color}`} />
                      <span className="text-sm font-medium">{scheme.label}</span>
                    </div>
                    {preferences.color_scheme === scheme.value && (
                      <Badge variant="default" size="sm">Active</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            Layout & Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Dashboard Layout</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {layoutOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => updatePreference('dashboard_layout', option.value)}
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-200 text-left
                        ${preferences.dashboard_layout === option.value 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{option.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                      {preferences.dashboard_layout === option.value && (
                        <Badge variant="default" size="sm" className="mt-2">Active</Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <Label>Font Size</Label>
              <Select
                value={preferences.font_size}
                onValueChange={(value) => 
                  updatePreference('font_size', value as AppearancePreferences['font_size'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label} - {size.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility & Preferences */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Accessibility & Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="show_animations"
                checked={preferences.show_animations}
                onCheckedChange={(checked) => 
                  updatePreference('show_animations', checked)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="show_animations" className="text-sm font-medium">
                  Enable Animations
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show smooth transitions and animations throughout the app
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="high_contrast"
                checked={preferences.high_contrast}
                onCheckedChange={(checked) => 
                  updatePreference('high_contrast', checked)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="high_contrast" className="text-sm font-medium">
                  High Contrast Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Increase contrast for better visibility and accessibility
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="compact_mode"
                checked={preferences.compact_mode}
                onCheckedChange={(checked) => 
                  updatePreference('compact_mode', checked)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="compact_mode" className="text-sm font-medium">
                  Compact Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Reduce spacing and padding to show more content on screen
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="sidebar_collapsed"
                checked={preferences.sidebar_collapsed}
                onCheckedChange={(checked) => 
                  updatePreference('sidebar_collapsed', checked)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="sidebar_collapsed" className="text-sm font-medium">
                  Collapse Sidebar by Default
                </Label>
                <p className="text-xs text-muted-foreground">
                  Start with a collapsed sidebar to maximize content space
                </p>
              </div>
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
          <div className={`
            p-4 rounded-lg border
            ${preferences.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
            ${preferences.high_contrast ? 'border-black' : ''}
          `}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className={`font-semibold ${
                  preferences.font_size === 'small' ? 'text-sm' : 
                  preferences.font_size === 'large' ? 'text-lg' : 'text-base'
                }`}>
                  Sample Dashboard Card
                </h4>
                <Badge variant="default">₪1,234</Badge>
              </div>
              <div className={`
                h-2 rounded-full bg-gradient-to-r 
                ${colorSchemes.find(s => s.value === preferences.color_scheme)?.color || 'from-primary to-secondary'}
                ${preferences.show_animations ? 'transition-all duration-500' : ''}
              `} />
              <p className={`text-muted-foreground ${
                preferences.font_size === 'small' ? 'text-xs' : 
                preferences.font_size === 'large' ? 'text-base' : 'text-sm'
              }`}>
                This is how your content will appear with the selected settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Summary */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Current Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Theme:</span>
              <span className="font-medium capitalize">{preferences.theme}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Color Scheme:</span>
              <span className="font-medium capitalize">{preferences.color_scheme}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Dashboard Layout:</span>
              <span className="font-medium capitalize">{preferences.dashboard_layout}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Font Size:</span>
              <span className="font-medium capitalize">{preferences.font_size}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Animations:</span>
              <span className="font-medium">{preferences.show_animations ? 'Enabled' : 'Disabled'}</span>
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
              Save Appearance Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}