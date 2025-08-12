"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, UserPlus, Mail, Phone, Eye, EyeOff, Users, Check, X, Clock } from "lucide-react"

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
  created_at: string
}

interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: "pending" | "accepted" | "declined"
}

interface MemberDirectoryProps {
  currentUserId: string
}

export default function MemberDirectory({ currentUserId }: MemberDirectoryProps) {
  const [members, setMembers] = useState<UserProfile[]>([])
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchMembers()
    fetchFriendships()
  }, [])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .neq("id", currentUserId)
        .order("first_name")

      if (error) throw error
      setMembers(data || [])
    } catch (err) {
      setError("Failed to load members")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFriendships = async () => {
    try {
      const { data, error } = await supabase
        .from("friendships")
        .select("*")
        .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)

      if (error) throw error
      setFriendships(data || [])
    } catch (err) {
      console.error("Failed to load friendships:", err)
    }
  }

  const sendFriendRequest = async (addresseeId: string) => {
    try {
      const { error } = await supabase.from("friendships").insert({
        requester_id: currentUserId,
        addressee_id: addresseeId,
        status: "pending",
      })

      if (error) throw error
      await fetchFriendships()
    } catch (err) {
      setError("Failed to send friend request")
      console.error(err)
    }
  }

  const respondToFriendRequest = async (friendshipId: string, response: "accepted" | "declined") => {
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: response, updated_at: new Date().toISOString() })
        .eq("id", friendshipId)

      if (error) throw error
      await fetchFriendships()
    } catch (err) {
      setError(`Failed to ${response === "accepted" ? "accept" : "decline"} friend request`)
      console.error(err)
    }
  }

  const getFriendshipStatus = (memberId: string) => {
    const friendship = friendships.find(
      (f) =>
        (f.requester_id === currentUserId && f.addressee_id === memberId) ||
        (f.requester_id === memberId && f.addressee_id === currentUserId),
    )
    return friendship
  }

  const canViewField = (member: UserProfile, field: "profile" | "phone" | "email") => {
    const friendship = getFriendshipStatus(member.id)
    const isFriend = friendship?.status === "accepted"

    const visibility =
      field === "profile"
        ? member.profile_visibility
        : field === "phone"
          ? member.phone_visibility
          : member.email_visibility

    if (visibility === "public") return true
    if (visibility === "friends" && isFriend) return true
    return false
  }

  const filteredMembers = members.filter((member) => {
    const searchLower = searchTerm.toLowerCase()
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase()
    return fullName.includes(searchLower) || member.email.toLowerCase().includes(searchLower)
  })

  const visibleMembers = filteredMembers.filter((member) => canViewField(member, "profile"))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">Loading church family...</p>
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

      {/* Search */}
      <Card className="groovy-card">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-base py-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleMembers.map((member) => {
          const friendship = getFriendshipStatus(member.id)
          const canViewPhone = canViewField(member, "phone")
          const canViewEmail = canViewField(member, "email")

          return (
            <Card key={member.id} className="groovy-card">
              <CardHeader className="text-center">
                <Avatar className="w-16 h-16 mx-auto mb-4 border-4 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                    {member.first_name[0]}
                    {member.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="font-serif text-xl">
                  {member.first_name} {member.last_name}
                </CardTitle>
                <div className="flex justify-center gap-2">
                  <Badge
                    variant={member.role === "admin" ? "default" : member.role === "leader" ? "secondary" : "outline"}
                  >
                    {member.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {member.bio && <p className="text-sm text-muted-foreground text-center italic">"{member.bio}"</p>}

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" />
                    {canViewEmail ? (
                      <span>{member.email}</span>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <EyeOff className="w-3 h-3" />
                        <span>Private</span>
                      </div>
                    )}
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4" />
                      {canViewPhone ? (
                        <span>{member.phone}</span>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <EyeOff className="w-3 h-3" />
                          <span>Private</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Friend Request Button */}
                <div className="pt-2">
                  {!friendship && (
                    <Button onClick={() => sendFriendRequest(member.id)} className="w-full groovy-button" size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Send Friend Request
                    </Button>
                  )}
                  {friendship?.status === "pending" && friendship.requester_id === currentUserId && (
                    <Button disabled className="w-full bg-transparent" size="sm" variant="outline">
                      <Clock className="w-4 h-4 mr-2" />
                      Request Sent
                    </Button>
                  )}
                  {friendship?.status === "pending" && friendship.requester_id === member.id && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => respondToFriendRequest(friendship.id, "accepted")}
                        className="groovy-button flex-1"
                        size="sm"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => respondToFriendRequest(friendship.id, "declined")}
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Decline
                      </Button>
                    </div>
                  )}
                  {friendship?.status === "accepted" && (
                    <Button disabled className="w-full bg-transparent" size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Friends
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {visibleMembers.length === 0 && !loading && (
        <Card className="groovy-card">
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold mb-2">No Members Found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "No members are currently visible to you"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
