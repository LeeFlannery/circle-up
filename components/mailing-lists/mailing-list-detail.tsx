"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ArrowLeft, Mail, Users, Send, UserPlus, UserMinus, Settings } from "lucide-react"
import Link from "next/link"

interface MailingList {
  id: string
  name: string
  description: string
  privacy_level: "public" | "friends" | "leaders" | "admin"
  created_by: string
  created_at: string
  user_profiles?: {
    first_name: string
    last_name: string
  }
}

interface Member {
  id: string
  user_id: string
  joined_at: string
  user_profiles: {
    first_name: string
    last_name: string
    email: string
  }
}

interface MailingListDetailProps {
  mailingList: MailingList
  currentUserId: string
  userRole: "admin" | "leader" | "member"
}

export default function MailingListDetail({ mailingList, currentUserId, userRole }: MailingListDetailProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [message, setMessage] = useState({ subject: "", content: "" })
  const supabase = createClient()

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("mailing_list_members")
        .select(`
          *,
          user_profiles(first_name, last_name, email)
        `)
        .eq("list_id", mailingList.id)
        .order("joined_at")

      if (error) throw error

      setMembers(data || [])
      setIsMember(data?.some((member) => member.user_id === currentUserId) || false)
    } catch (err) {
      setError("Failed to load members")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const joinList = async () => {
    try {
      const { error } = await supabase.from("mailing_list_members").insert({
        list_id: mailingList.id,
        user_id: currentUserId,
      })

      if (error) throw error
      await fetchMembers()
    } catch (err) {
      setError("Failed to join mailing list")
      console.error(err)
    }
  }

  const leaveList = async () => {
    try {
      const { error } = await supabase
        .from("mailing_list_members")
        .delete()
        .eq("list_id", mailingList.id)
        .eq("user_id", currentUserId)

      if (error) throw error
      await fetchMembers()
    } catch (err) {
      setError("Failed to leave mailing list")
      console.error(err)
    }
  }

  const sendMessage = async () => {
    if (!message.subject.trim() || !message.content.trim()) return

    setSendLoading(true)
    try {
      // In a real app, this would send emails to all members
      // For now, we'll just create a message record
      const { error } = await supabase.from("messages").insert({
        title: `[${mailingList.name}] ${message.subject}`,
        content: message.content,
        message_type: "announcement",
        visibility: mailingList.privacy_level,
        created_by: currentUserId,
      })

      if (error) throw error

      setShowSendDialog(false)
      setMessage({ subject: "", content: "" })
      // In a real implementation, you'd integrate with an email service here
      alert("Message sent to all list members!")
    } catch (err) {
      setError("Failed to send message")
      console.error(err)
    } finally {
      setSendLoading(false)
    }
  }

  const isOwner = mailingList.created_by === currentUserId
  const canSendMessages = isOwner || userRole === "admin" || userRole === "leader"

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/mailing-lists">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lists
          </Link>
        </Button>
      </div>

      {/* List Info */}
      <Card className="groovy-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="font-serif text-3xl mb-2">{mailingList.name}</CardTitle>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-primary text-primary-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span className="capitalize">{mailingList.privacy_level}</span>
                  </div>
                </Badge>
                <Badge variant="outline">
                  <Users className="w-3 h-3 mr-1" />
                  {members.length} members
                </Badge>
              </div>
              {mailingList.description && (
                <CardDescription className="text-base mb-4">{mailingList.description}</CardDescription>
              )}
              <div className="text-sm text-muted-foreground">
                Created by {mailingList.user_profiles?.first_name} {mailingList.user_profiles?.last_name} •{" "}
                {new Date(mailingList.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {isMember ? (
              <Button onClick={leaveList} variant="outline">
                <UserMinus className="w-4 h-4 mr-2" />
                Leave List
              </Button>
            ) : (
              <Button onClick={joinList} className="groovy-button">
                <UserPlus className="w-4 h-4 mr-2" />
                Join List
              </Button>
            )}

            {canSendMessages && (
              <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                <DialogTrigger asChild>
                  <Button className="groovy-button">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Send Message to List</DialogTitle>
                    <DialogDescription>Send an email to all {members.length} members of this list</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={message.subject}
                        onChange={(e) => setMessage({ ...message, subject: e.target.value })}
                        placeholder="Important update about..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Message</Label>
                      <Textarea
                        id="content"
                        value={message.content}
                        onChange={(e) => setMessage({ ...message, content: e.target.value })}
                        placeholder="Write your message here..."
                        rows={6}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={sendMessage} disabled={sendLoading} className="groovy-button flex-1">
                        {sendLoading ? "Sending..." : "Send Message"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {isOwner && (
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Manage List
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card className="groovy-card">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Members ({members.length})</CardTitle>
          <CardDescription>People who receive messages from this list</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No members yet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <Avatar className="w-10 h-10 border-2 border-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                      {member.user_profiles.first_name[0]}
                      {member.user_profiles.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {member.user_profiles.first_name} {member.user_profiles.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{member.user_profiles.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
