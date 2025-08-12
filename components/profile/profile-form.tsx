"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Save, Shield, Eye, Users, Lock } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  bio: string
  profile_visibility: "public" | "friends" | "private"
  phone_visibility: "public" | "friends" | "private"
  email_visibility: "public" | "friends" | "private"
  role: "admin" | "leader" | "member"
}

interface ProfileFormProps {
  profile: UserProfile | null
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
    profile_visibility: profile?.profile_visibility || "friends",
    phone_visibility: profile?.phone_visibility || "friends",
    email_visibility: profile?.email_visibility || "friends",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase.from("user_profiles").update(formData).eq("id", profile?.id)

      if (error) throw error
      setSuccess("Profile updated successfully!")
    } catch (err) {
      setError("Failed to update profile")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Eye className="w-4 h-4" />
      case "friends":
        return <Users className="w-4 h-4" />
      case "private":
        return <Lock className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "Visible to everyone"
      case "friends":
        return "Visible to friends only"
      case "private":
        return "Hidden from everyone"
      default:
        return "Visible to friends only"
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {success && (
        <Alert className="border-accent bg-accent/10">
          <AlertDescription className="text-accent-foreground">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture & Basic Info */}
        <Card className="groovy-card">
          <CardHeader>
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Basic Information
            </CardTitle>
            <CardDescription>Your name and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Avatar className="w-24 h-24 border-4 border-primary">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {formData.first_name[0]}
                  {formData.last_name[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
                type="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell your church family a bit about yourself..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="groovy-card">
          <CardHeader>
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Privacy Settings
            </CardTitle>
            <CardDescription>Control who can see your information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select
                  value={formData.profile_visibility}
                  onValueChange={(value) => handleInputChange("profile_visibility", value)}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      {getVisibilityIcon(formData.profile_visibility)}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>Public - Everyone can see</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Friends - Friends only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>Private - Hidden</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">{getVisibilityDescription(formData.profile_visibility)}</p>
              </div>

              <div className="space-y-2">
                <Label>Email Visibility</Label>
                <Select
                  value={formData.email_visibility}
                  onValueChange={(value) => handleInputChange("email_visibility", value)}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      {getVisibilityIcon(formData.email_visibility)}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>Public</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Friends Only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>Private</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Phone Visibility</Label>
                <Select
                  value={formData.phone_visibility}
                  onValueChange={(value) => handleInputChange("phone_visibility", value)}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      {getVisibilityIcon(formData.phone_visibility)}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>Public</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Friends Only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>Private</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Display */}
        <Card className="groovy-card">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Church Role</CardTitle>
            <CardDescription>Your current role in the church community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-lg">Current Role:</span>
              <span className="font-semibold text-primary capitalize">{profile?.role || "Member"}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Contact a church administrator to change your role.</p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button type="submit" disabled={loading} className="w-full groovy-button text-lg py-6">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
