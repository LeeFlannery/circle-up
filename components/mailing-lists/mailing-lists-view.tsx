"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Mail, Users, Lock, Eye, UserPlus, UserMinus, Settings } from "lucide-react"

interface MailingList {
  id: string
  name: string
  description: string
  privacy_level: "public" | "friends" | "leaders" | "admin"
  created_by: string
  created_at: string
  creator_name?: string
  member_count?: number
  is_member?: boolean
}

interface MailingListsViewProps {
  currentUserId: string
  userRole: "admin" | "leader" | "member"
}

export default function MailingListsView({ currentUserId, userRole }: MailingListsViewProps) {
  const [mailingLists, setMailingLists] = useState<MailingList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newList, setNewList] = useState({
    name: "",
    description: "",
    privacy_level: "public" as "public" | "friends" | "leaders" | "admin",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchMailingLists()
  }, [])

  const fetchMailingLists = async () => {
    try {
      // Get all mailing lists with creator info and member counts
      const { data: lists, error: listsError } = await supabase
        .from("mailing_lists")
        .select(`
          *,
          user_profiles!mailing_lists_created_by_fkey(first_name, last_name)
        `)
        .order("created_at", { ascending: false })

      if (listsError) throw listsError

      // Get member counts and membership status
      const listsWithCounts = await Promise.all(
        (lists || []).map(async (list) => {
          // Get member count
          const { count } = await supabase
            .from("mailing_list_members")
            .select("*", { count: "exact", head: true })
            .eq("list_id", list.id)

          // Check if current user is a member
          const { data: membership } = await supabase
            .from("mailing_list_members")
            .select("id")
            .eq("list_id", list.id)
            .eq("user_id", currentUserId)
            .single()

          return {
            ...list,
            creator_name: `${list.user_profiles?.first_name} ${list.user_profiles?.last_name}`,
            member_count: count || 0,
            is_member: !!membership,
          }
        }),
      )

      // Filter based on privacy level and user role
      const visibleLists = listsWithCounts.filter((list) => {
        if (list.privacy_level === "public") return true
        if (list.privacy_level === "friends") return true // TODO: Check friendship status
        if (list.privacy_level === "leaders" && (userRole === "leader" || userRole === "admin")) return true
        if (list.privacy_level === "admin" && userRole === "admin") return true
        if (list.created_by === currentUserId) return true
        return false
      })

      setMailingLists(visibleLists)
    } catch (err) {
      setError("Failed to load mailing lists")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createMailingList = async () => {
    if (!newList.name.trim()) return

    setCreateLoading(true)
    try {
      const { error } = await supabase.from("mailing_lists").insert({
        name: newList.name,
        description: newList.description,
        privacy_level: newList.privacy_level,
        created_by: currentUserId,
      })

      if (error) throw error

      setShowCreateDialog(false)
      setNewList({ name: "", description: "", privacy_level: "public" })
      await fetchMailingLists()
    } catch (err) {
      setError("Failed to create mailing list")
      console.error(err)
    } finally {
      setCreateLoading(false)
    }
  }

  const joinList = async (listId: string) => {
    try {
      const { error } = await supabase.from("mailing_list_members").insert({
        list_id: listId,
        user_id: currentUserId,
      })

      if (error) throw error
      await fetchMailingLists()
    } catch (err) {
      setError("Failed to join mailing list")
      console.error(err)
    }
  }

  const leaveList = async (listId: string) => {
    try {
      const { error } = await supabase
        .from("mailing_list_members")
        .delete()
        .eq("list_id", listId)
        .eq("user_id", currentUserId)

      if (error) throw error
      await fetchMailingLists()
    } catch (err) {
      setError("Failed to leave mailing list")
      console.error(err)
    }
  }

  const getPrivacyIcon = (level: string) => {
    switch (level) {
      case "public":
        return <Eye className="w-4 h-4" />
      case "friends":
        return <Users className="w-4 h-4" />
      case "leaders":
        return <Settings className="w-4 h-4" />
      case "admin":
        return <Lock className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const getPrivacyColor = (level: string) => {
    switch (level) {
      case "public":
        return "bg-accent text-accent-foreground"
      case "friends":
        return "bg-secondary text-secondary-foreground"
      case "leaders":
        return "bg-primary text-primary-foreground"
      case "admin":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-accent text-accent-foreground"
    }
  }

  const filteredLists = mailingLists.filter(
    (list) =>
      list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">Loading mailing lists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Create */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="groovy-card flex-1">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search mailing lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="groovy-button">
              <Plus className="w-4 h-4 mr-2" />
              Create List
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Create Mailing List</DialogTitle>
              <DialogDescription>Start a new topic-based group for your church community</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">List Name</Label>
                <Input
                  id="name"
                  value={newList.name}
                  onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                  placeholder="Youth Group Updates"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newList.description}
                  onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                  placeholder="Updates and announcements for our youth ministry"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Privacy Level</Label>
                <Select
                  value={newList.privacy_level}
                  onValueChange={(value: "public" | "friends" | "leaders" | "admin") =>
                    setNewList({ ...newList, privacy_level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>Public - Everyone can see and join</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Friends - Friends can see and join</span>
                      </div>
                    </SelectItem>
                    {(userRole === "leader" || userRole === "admin") && (
                      <SelectItem value="leaders">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          <span>Leaders - Leaders and admins only</span>
                        </div>
                      </SelectItem>
                    )}
                    {userRole === "admin" && (
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          <span>Admin - Administrators only</span>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={createMailingList} disabled={createLoading} className="groovy-button flex-1">
                  {createLoading ? "Creating..." : "Create List"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mailing Lists Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLists.map((list) => (
          <Card key={list.id} className="groovy-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="font-serif text-xl mb-2">{list.name}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPrivacyColor(list.privacy_level)}>
                      <div className="flex items-center gap-1">
                        {getPrivacyIcon(list.privacy_level)}
                        <span className="capitalize">{list.privacy_level}</span>
                      </div>
                    </Badge>
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      {list.member_count} members
                    </Badge>
                  </div>
                </div>
              </div>
              {list.description && <CardDescription className="text-sm">{list.description}</CardDescription>}
              <div className="text-xs text-muted-foreground">
                Created by {list.creator_name} • {new Date(list.created_at).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {list.is_member ? (
                  <Button onClick={() => leaveList(list.id)} variant="outline" className="w-full" size="sm">
                    <UserMinus className="w-4 h-4 mr-2" />
                    Leave List
                  </Button>
                ) : (
                  <Button onClick={() => joinList(list.id)} className="groovy-button w-full" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join List
                  </Button>
                )}
                {list.created_by === currentUserId && (
                  <Button variant="outline" className="w-full bg-transparent" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage List
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLists.length === 0 && !loading && (
        <Card className="groovy-card">
          <CardContent className="text-center py-12">
            <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold mb-2">No Mailing Lists Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "No mailing lists are available to you"}
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="groovy-button">
              <Plus className="w-4 h-4 mr-2" />
              Create the First List
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
