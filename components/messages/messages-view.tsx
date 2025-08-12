"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, MessageCircle, Heart, Megaphone, Clock, Eye, Users, Settings, Lock } from "lucide-react"

interface Message {
  id: string
  title: string
  content: string
  message_type: "announcement" | "prayer_request" | "general"
  visibility: "public" | "friends" | "leaders" | "admin"
  created_by: string
  created_at: string
  updated_at: string
  creator_profile?: {
    first_name: string
    last_name: string
    role: string
  }
}

interface MessagesViewProps {
  currentUserId: string
  userRole: "admin" | "leader" | "member"
}

export default function MessagesView({ currentUserId, userRole }: MessagesViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "announcement" | "prayer_request" | "general">("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newMessage, setNewMessage] = useState({
    title: "",
    content: "",
    message_type: "announcement" as "announcement" | "prayer_request" | "general",
    visibility: "public" as "public" | "friends" | "leaders" | "admin",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select(`
          *,
          user_profiles!messages_created_by_fkey(first_name, last_name, role)
        `)
        .order("created_at", { ascending: false })

      if (messagesError) throw messagesError

      // Filter messages based on visibility and user role
      const visibleMessages = (messagesData || [])
        .map((message) => ({
          ...message,
          creator_profile: message.user_profiles,
        }))
        .filter((message) => {
          if (message.visibility === "public") return true
          if (message.visibility === "friends") return true // TODO: Check friendship status
          if (message.visibility === "leaders" && (userRole === "leader" || userRole === "admin")) return true
          if (message.visibility === "admin" && userRole === "admin") return true
          if (message.created_by === currentUserId) return true
          return false
        })

      setMessages(visibleMessages)
    } catch (err) {
      setError("Failed to load messages")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createMessage = async () => {
    if (!newMessage.title.trim() || !newMessage.content.trim()) return

    setCreateLoading(true)
    try {
      const { error } = await supabase.from("messages").insert({
        title: newMessage.title,
        content: newMessage.content,
        message_type: newMessage.message_type,
        visibility: newMessage.visibility,
        created_by: currentUserId,
      })

      if (error) throw error

      setShowCreateDialog(false)
      setNewMessage({
        title: "",
        content: "",
        message_type: "announcement",
        visibility: "public",
      })
      await fetchMessages()
    } catch (err) {
      setError("Failed to create message")
      console.error(err)
    } finally {
      setCreateLoading(false)
    }
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Megaphone className="w-4 h-4" />
      case "prayer_request":
        return <Heart className="w-4 h-4" />
      case "general":
        return <MessageCircle className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "announcement":
        return "bg-primary text-primary-foreground"
      case "prayer_request":
        return "bg-secondary text-secondary-foreground"
      case "general":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-accent text-accent-foreground"
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Eye className="w-3 h-3" />
      case "friends":
        return <Users className="w-3 h-3" />
      case "leaders":
        return <Settings className="w-3 h-3" />
      case "admin":
        return <Lock className="w-3 h-3" />
      default:
        return <Eye className="w-3 h-3" />
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "bg-accent/20 text-accent-foreground"
      case "friends":
        return "bg-secondary/20 text-secondary-foreground"
      case "leaders":
        return "bg-primary/20 text-primary-foreground"
      case "admin":
        return "bg-destructive/20 text-destructive-foreground"
      default:
        return "bg-accent/20 text-accent-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } else if (diffInHours < 168) {
      // Less than a week
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }
  }

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || message.message_type === filterType
    return matchesSearch && matchesType
  })

  const groupedMessages = {
    announcement: filteredMessages.filter((m) => m.message_type === "announcement"),
    prayer_request: filteredMessages.filter((m) => m.message_type === "prayer_request"),
    general: filteredMessages.filter((m) => m.message_type === "general"),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">Loading messages...</p>
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
                placeholder="Search messages..."
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
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Create Message</DialogTitle>
              <DialogDescription>Share an announcement, prayer request, or general message</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newMessage.title}
                  onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                  placeholder="Sunday Service Update"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Message</Label>
                <Textarea
                  id="content"
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  placeholder="Share your message with the community..."
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Message Type</Label>
                  <Select
                    value={newMessage.message_type}
                    onValueChange={(value: "announcement" | "prayer_request" | "general") =>
                      setNewMessage({ ...newMessage, message_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">
                        <div className="flex items-center gap-2">
                          <Megaphone className="w-4 h-4" />
                          <span>Announcement</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="prayer_request">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          <span>Prayer Request</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="general">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          <span>General</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select
                    value={newMessage.visibility}
                    onValueChange={(value: "public" | "friends" | "leaders" | "admin") =>
                      setNewMessage({ ...newMessage, visibility: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                          <span>Friends</span>
                        </div>
                      </SelectItem>
                      {(userRole === "leader" || userRole === "admin") && (
                        <SelectItem value="leaders">
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            <span>Leaders</span>
                          </div>
                        </SelectItem>
                      )}
                      {userRole === "admin" && (
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            <span>Admin</span>
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={createMessage} disabled={createLoading} className="groovy-button flex-1">
                  {createLoading ? "Creating..." : "Create Message"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" onClick={() => setFilterType("all")}>
            All ({filteredMessages.length})
          </TabsTrigger>
          <TabsTrigger value="announcements" onClick={() => setFilterType("announcement")}>
            <div className="flex items-center gap-1">
              <Megaphone className="w-3 h-3" />
              <span className="hidden sm:inline">Announcements</span>
              <span className="sm:hidden">News</span> ({groupedMessages.announcement.length})
            </div>
          </TabsTrigger>
          <TabsTrigger value="prayers" onClick={() => setFilterType("prayer_request")}>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span className="hidden sm:inline">Prayers</span>
              <span className="sm:hidden">Pray</span> ({groupedMessages.prayer_request.length})
            </div>
          </TabsTrigger>
          <TabsTrigger value="general" onClick={() => setFilterType("general")}>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span className="hidden sm:inline">General</span>
              <span className="sm:hidden">Chat</span> ({groupedMessages.general.length})
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {filteredMessages.length === 0 ? (
            <Card className="groovy-card">
              <CardContent className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold mb-2">No Messages Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "No messages have been posted yet"}
                </p>
                <Button onClick={() => setShowCreateDialog(true)} className="groovy-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Create the First Message
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredMessages.map((message) => (
              <Card key={message.id} className="groovy-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getMessageTypeColor(message.message_type)}>
                          <div className="flex items-center gap-1">
                            {getMessageTypeIcon(message.message_type)}
                            <span className="capitalize">{message.message_type.replace("_", " ")}</span>
                          </div>
                        </Badge>
                        <Badge variant="outline" className={getVisibilityColor(message.visibility)}>
                          <div className="flex items-center gap-1">
                            {getVisibilityIcon(message.visibility)}
                            <span className="capitalize">{message.visibility}</span>
                          </div>
                        </Badge>
                      </div>
                      <CardTitle className="font-serif text-xl mb-2">{message.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 border border-primary">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {message.creator_profile?.first_name[0]}
                          {message.creator_profile?.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {message.creator_profile?.first_name} {message.creator_profile?.last_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {message.creator_profile?.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(message.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4 mt-6">
          {groupedMessages.announcement.map((message) => (
            <Card key={message.id} className="groovy-card"></Card>
          ))}
        </TabsContent>

        <TabsContent value="prayers" className="space-y-4 mt-6">
          {groupedMessages.prayer_request.map((message) => (
            <Card key={message.id} className="groovy-card"></Card>
          ))}
        </TabsContent>

        <TabsContent value="general" className="space-y-4 mt-6">
          {groupedMessages.general.map((message) => (
            <Card key={message.id} className="groovy-card"></Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
