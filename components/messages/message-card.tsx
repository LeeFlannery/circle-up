"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, Megaphone, Heart, MessageCircle, Eye, Users, Settings, Lock } from "lucide-react"

interface Message {
  id: string
  title: string
  content: string
  message_type: "announcement" | "prayer_request" | "general"
  visibility: "public" | "friends" | "leaders" | "admin"
  created_at: string
  creator_profile?: {
    first_name: string
    last_name: string
    role: string
  }
}

interface MessageCardProps {
  message: Message
}

export default function MessageCard({ message }: MessageCardProps) {
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

  return (
    <Card className="groovy-card">
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
  )
}
