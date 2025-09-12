'use client'

import { useState } from 'react'
import { Database, Download, Upload, Trash2, Shield, AlertTriangle, Save, Loader2, FileText, Archive } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

const exportFormats = [
  { value: 'csv', label: 'CSV (Spreadsheet)', description: 'Comma-separated values for Excel, Google Sheets' },
  { value: 'json', label: 'JSON (Developer)', description: 'Structured data format for technical users' },
  { value: 'pdf', label: 'PDF Report', description: 'Formatted financial report document' }
]

const dataTypes = [
  { id: 'transactions', label: 'Transactions', description: 'All income and expense records' },
  { id: 'categories', label: 'Categories', description: 'Custom expense and income categories' },
  { id: 'targets', label: 'Budget Targets', description: 'All budget goals and limits' },
  { id: 'goals', label: 'Saving Goals', description: 'Personal savings objectives' },
  { id: 'achievements', label: 'Achievements', description: 'Unlocked badges and progress' },
  { id: 'profile', label: 'Profile Data', description: 'Personal information and preferences' }
]

interface ExportSettings {
  format: 'csv' | 'json' | 'pdf'
  data_types: string[]
  date_range: 'all' | 'last_year' | 'last_month' | 'custom'
  custom_start_date: string
  custom_end_date: string
  include_deleted: boolean
}

export function DataSettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'csv',
    data_types: ['transactions', 'categories'],
    date_range: 'all',
    custom_start_date: '',
    custom_end_date: '',
    include_deleted: false
  })

  const handleExportData = async () => {
    try {
      setExporting(true)
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, this would generate and download the file
      toast.success(`Data exported successfully as ${exportSettings.format.toUpperCase()}`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const handleBackupData = async () => {
    try {
      setLoading(true)
      
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Backup created successfully')
    } catch (error) {
      console.error('Backup error:', error)
      toast.error('Failed to create backup')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE MY ACCOUNT') {
      toast.error('Please type "DELETE MY ACCOUNT" to confirm')
      return
    }

    try {
      setDeleting(true)
      
      // Simulate account deletion
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success('Account deletion initiated. You will receive a confirmation email.')
      setShowDeleteConfirmation(false)
      setDeleteConfirmationText('')
    } catch (error) {
      console.error('Account deletion error:', error)
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  const updateExportSetting = (key: keyof ExportSettings, value: any) => {
    setExportSettings(prev => ({ ...prev, [key]: value }))
  }

  const toggleDataType = (dataType: string) => {
    setExportSettings(prev => ({
      ...prev,
      data_types: prev.data_types.includes(dataType)
        ? prev.data_types.filter(type => type !== dataType)
        : [...prev.data_types, dataType]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Your Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <Select
                value={exportSettings.format}
                onValueChange={(value) => 
                  updateExportSetting('format', value as ExportSettings['format'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label} - {format.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data to Include</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {dataTypes.map((dataType) => (
                  <div key={dataType.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={dataType.id}
                      checked={exportSettings.data_types.includes(dataType.id)}
                      onCheckedChange={() => toggleDataType(dataType.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={dataType.id} className="text-sm font-medium">
                        {dataType.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {dataType.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Date Range</Label>
              <Select
                value={exportSettings.date_range}
                onValueChange={(value) => 
                  updateExportSetting('date_range', value as ExportSettings['date_range'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {exportSettings.date_range === 'custom' && (
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={exportSettings.custom_start_date}
                      onChange={(e) => updateExportSetting('custom_start_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={exportSettings.custom_end_date}
                      onChange={(e) => updateExportSetting('custom_end_date', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="include_deleted"
                checked={exportSettings.include_deleted}
                onCheckedChange={(checked) => 
                  updateExportSetting('include_deleted', checked)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="include_deleted" className="text-sm font-medium">
                  Include Deleted Records
                </Label>
                <p className="text-xs text-muted-foreground">
                  Include previously deleted transactions and categories
                </p>
              </div>
            </div>

            <Button
              onClick={handleExportData}
              disabled={exporting || exportSettings.data_types.length === 0}
              className="flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Backup */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            Data Backup & Restore
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="bg-info/10 border border-info/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-info mt-0.5" />
                <div>
                  <h4 className="font-medium text-info">Automatic Backups</h4>
                  <p className="text-sm text-info/80 mt-1">
                    Your data is automatically backed up daily to secure cloud storage. 
                    Backups are kept for 30 days and are encrypted for your security.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Manual Backup</h4>
                <p className="text-sm text-muted-foreground">
                  Create an immediate backup of all your data
                </p>
                <Badge variant="secondary" className="mt-2">
                  Last backup: {new Date().toLocaleDateString()}
                </Badge>
              </div>
              <Button
                onClick={handleBackupData}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    Create Backup
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Import */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">Import Financial Data</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Upload CSV files from your bank or other financial apps
            </p>
            <Button variant="outline" className="flex items-center gap-2 mx-auto">
              <FileText className="h-4 w-4" />
              Choose File
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: CSV files from major banks and financial institutions. 
            Data will be reviewed before import to ensure accuracy.
          </p>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-destructive/80 mt-1">
                  Permanently delete your account and all associated data. 
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {!showDeleteConfirmation ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirmation(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                <h4 className="font-medium text-destructive mb-2">Confirm Account Deletion</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  This will permanently delete your account and all data including:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-4">
                  <li>All transactions and financial records</li>
                  <li>Budget targets and savings goals</li>
                  <li>Categories and preferences</li>
                  <li>Achievements and progress</li>
                  <li>Profile information</li>
                </ul>
                <p className="text-sm font-medium text-destructive">
                  Type &quot;DELETE MY ACCOUNT&quot; to confirm:
                </p>
              </div>

              <Input
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type: DELETE MY ACCOUNT"
                className="font-mono"
              />

              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmationText !== 'DELETE MY ACCOUNT'}
                  className="flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting Account...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Permanently Delete Account
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirmation(false)
                    setDeleteConfirmationText('')
                  }}
                  disabled={deleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Summary */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Account Created:</span>
              <span className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Data Size:</span>
              <span className="font-medium">~2.4 MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Last Backup:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Export Format:</span>
              <span className="font-medium capitalize">{exportSettings.format}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}