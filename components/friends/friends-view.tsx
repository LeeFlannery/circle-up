"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Heart, UserPlus, UserMinus, Check, X, Clock } from "lucide-react"

interface Friend {
  id: string
  requester_id: string
  addressee_id: string
  status: "pending" | "accepted" | "declined"
  created_at: string
  updated_at: string
  friend_profile?: {
    id: string
    first_name: string
    last_name: string
    email: string
    bio: string
    role: string
  }
}

interface FriendsViewProps {
  currentUserId: string
}

export default function FriendsView({ currentUserId }: FriendsViewProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([])
  const [sentRequests, setSentRequests] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchFriendships()
  }, [])

  const fetchFriendships = async () => {
    try {
      // Get all friendships involving the current user
      const { data: friendships, error: friendshipsError } = await supabase
        .from("friendships")
        .select(`
          *,
          requester:user_profiles!friendships_requester_id_fkey(id, first_name, last_name, email, bio, role),
          addressee:user_profiles!friendships_addressee_id_fkey(id, first_name, last_name, email, bio, role)
        `)
        .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false })

      if (friendshipsError) throw friendshipsError

      // Process friendships to get the friend's profile and categorize
      const processedFriendships = (friendships || []).map((friendship) => {
        const isRequester = friendship.requester_id === currentUserId
        const friendProfile = isRequester ? friendship.addressee : friendship.requester

        return {
          ...friendship,
          friend_profile: friendProfile,
        }
      })

      // Categorize friendships
      const accepted = processedFriendships.filter((f) => f.status === "accepted")
      const pending = processedFriendships.filter((f) => f.status === "pending" && f.addressee_id === currentUserId)
      const sent = processedFriendships.filter((f) => f.status === "pending" && f.requester_id === currentUserId)

      setFriends(accepted)
      setPendingRequests(pending)
      setSentRequests(sent)
    } catch (err) {
      setError("Failed to load friendships")
      console.error(err)
    } finally {
      setLoading(false)
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

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase.from("friendships").delete().eq("id", friendshipId)

      if (error) throw error
      await fetchFriendships()
    } catch (err) {
      setError("Failed to remove friend")
      console.error(err)
    }
  }

  const cancelFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase.from("friendships").delete().eq("id", friendshipId)

      if (error) throw error
      await fetchFriendships()
    } catch (err) {
      setError("Failed to cancel friend request")
      console.error(err)
    }
  }

  const filteredFriends = friends.filter((friend) => {
    if (!friend.friend_profile) return false
    const searchLower = searchTerm.toLowerCase()
    const fullName = `${friend.friend_profile.first_name} ${friend.friend_profile.last_name}`.toLowerCase()
    return fullName.includes(searchLower) || friend.friend_profile.email.toLowerCase().includes(searchLower)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">Loading your connections...</p>
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

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Friends ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Sent ({sentRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Friends Tab */}
        <TabsContent value="friends" className="space-y-6">
          {/* Search */}
          <Card className="groovy-card">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search your friends..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Friends Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFriends.map((friend) => (
              <Card key={friend.id} className="groovy-card">
                <CardHeader className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-4 border-4 border-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                      {friend.friend_profile?.first_name[0]}
                      {friend.friend_profile?.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="font-serif text-xl">
                    {friend.friend_profile?.first_name} {friend.friend_profile?.last_name}
                  </CardTitle>
                  <div className="flex justify-center">
                    <Badge variant={friend.friend_profile?.role === "admin" ? "default" : "outline"}>
                      {friend.friend_profile?.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {friend.friend_profile?.bio && (
                    <p className="text-sm text-muted-foreground text-center italic">"{friend.friend_profile.bio}"</p>
                  )}
                  <div className="text-xs text-muted-foreground text-center">
                    Friends since {new Date(friend.updated_at || friend.created_at).toLocaleDateString()}
                  </div>
                  <Button
                    onClick={() => removeFriend(friend.id)}
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Remove Friend
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFriends.length === 0 && (
            <Card className="groovy-card">
              <CardContent className="text-center py-12">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold mb-2">
                  {searchTerm ? "No Friends Found" : "No Friends Yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Start connecting with your church family through the member directory"}
                </p>
                <Button asChild className="groovy-button">
                  <a href="/dashboard/directory">Browse Directory</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pending Requests Tab */}
        <TabsContent value="pending" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="groovy-card">
                <CardHeader className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-4 border-4 border-secondary">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-lg font-bold">
                      {request.friend_profile?.first_name[0]}
                      {request.friend_profile?.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="font-serif text-xl">
                    {request.friend_profile?.first_name} {request.friend_profile?.last_name}
                  </CardTitle>
                  <div className="flex justify-center">
                    <Badge variant={request.friend_profile?.role === "admin" ? "default" : "outline"}>
                      {request.friend_profile?.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.friend_profile?.bio && (
                    <p className="text-sm text-muted-foreground text-center italic">"{request.friend_profile.bio}"</p>
                  )}
                  <div className="text-xs text-muted-foreground text-center">
                    Sent {new Date(request.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => respondToFriendRequest(request.id, "accepted")}
                      className="groovy-button flex-1"
                      size="sm"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => respondToFriendRequest(request.id, "declined")}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pendingRequests.length === 0 && (
            <Card className="groovy-card">
              <CardContent className="text-center py-12">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground">You don't have any friend requests waiting for your response</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sent Requests Tab */}
        <TabsContent value="sent" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sentRequests.map((request) => (
              <Card key={request.id} className="groovy-card">
                <CardHeader className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-4 border-4 border-accent">
                    <AvatarFallback className="bg-accent text-accent-foreground text-lg font-bold">
                      {request.friend_profile?.first_name[0]}
                      {request.friend_profile?.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="font-serif text-xl">
                    {request.friend_profile?.first_name} {request.friend_profile?.last_name}
                  </CardTitle>
                  <div className="flex justify-center">
                    <Badge variant={request.friend_profile?.role === "admin" ? "default" : "outline"}>
                      {request.friend_profile?.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.friend_profile?.bio && (
                    <p className="text-sm text-muted-foreground text-center italic">"{request.friend_profile.bio}"</p>
                  )}
                  <div className="text-xs text-muted-foreground text-center">
                    Sent {new Date(request.created_at).toLocaleDateString()}
                  </div>
                  <Button
                    onClick={() => cancelFriendRequest(request.id)}
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Request
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {sentRequests.length === 0 && (
            <Card className="groovy-card">
              <CardContent className="text-center py-12">
                <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold mb-2">No Sent Requests</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't sent any friend requests that are still pending
                </p>
                <Button asChild className="groovy-button">
                  <a href="/dashboard/directory">Find Friends</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
