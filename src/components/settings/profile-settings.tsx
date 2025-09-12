'use client'

import { useState, useRef, useEffect } from 'react'
import { User, Upload, Camera, X, Save, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase-client'
import { toast } from 'sonner'

interface ProfileData {
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
}

export function ProfileSettings() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: user?.email || '',
    avatar_url: null
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const supabase = createClient()

  // Load profile data
  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  const loadProfile = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        toast.error('Failed to load profile data')
        return
      }

      if (data) {
        setProfileData(data)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload image
    uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    if (!user?.id) return

    try {
      setUploading(true)
      
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error('Failed to upload image')
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        // Update profile with new avatar URL
        const supabaseClient = supabase as any
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ avatar_url: urlData.publicUrl })
          .eq('id', user.id)

        if (updateError) {
          console.error('Profile update error:', updateError)
          toast.error('Failed to update profile')
          return
        }

        setProfileData(prev => ({ ...prev, avatar_url: urlData.publicUrl }))
        toast.success('Avatar updated successfully')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
      setPreviewUrl(null)
    }
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return

    try {
      setSaving(true)

      const supabaseClient = supabase as any
      const { error } = await supabaseClient
        .from('profiles')
        .update({
          first_name: profileData.first_name || null,
          last_name: profileData.last_name || null
        })
        .eq('id', user.id)

      if (error) {
        console.error('Profile update error:', error)
        toast.error('Failed to update profile')
        return
      }

      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const removeAvatar = async () => {
    if (!user?.id) return

    try {
      setUploading(true)

      const supabaseClient = supabase as any
      const { error } = await supabaseClient
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)

      if (error) {
        console.error('Error removing avatar:', error)
        toast.error('Failed to remove avatar')
        return
      }

      setProfileData(prev => ({ ...prev, avatar_url: null }))
      toast.success('Avatar removed')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to remove avatar')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <Card variant="glass">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Loading profile...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : profileData.avatar_url ? (
                    <img 
                      src={profileData.avatar_url} 
                      alt="Avatar" 
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                  )}
                </Avatar>
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {profileData.avatar_url ? 'Change' : 'Upload'}
                </Button>
                
                {profileData.avatar_url && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={removeAvatar}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={profileData.first_name || ''}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      first_name: e.target.value 
                    }))}
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name || ''}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      last_name: e.target.value 
                    }))}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted/50"
                  />
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Email address cannot be changed here. Contact support if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveProfile}
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
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Account ID</Label>
              <p className="font-mono text-xs bg-muted/30 p-2 rounded border">
                {user?.id}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Member Since</Label>
              <p className="text-foreground">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}