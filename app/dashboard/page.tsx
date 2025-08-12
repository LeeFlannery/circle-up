import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Calendar, MessageCircle, Mail, Heart, Sparkles } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-primary groovy-text mb-4">
            Welcome Back, {profile?.first_name || "Friend"}!
          </h1>
          <p className="text-xl text-muted-foreground">Ready to connect with your church family in a groovy way?</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="groovy-card">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="font-serif text-xl">Member Directory</CardTitle>
              <CardDescription>Connect with your church family</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="groovy-button w-full">
                <Link href="/dashboard/directory">Browse Directory</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="groovy-card">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-secondary-foreground" />
              </div>
              <CardTitle className="font-serif text-xl">Church Calendar</CardTitle>
              <CardDescription>Stay updated on events</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="groovy-button w-full">
                <Link href="/dashboard/calendar">View Calendar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="groovy-card">
            <CardHeader>
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="font-serif text-xl">Messages</CardTitle>
              <CardDescription>Church announcements & updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="groovy-button w-full">
                <Link href="/dashboard/messages">Read Messages</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="groovy-card">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="font-serif text-xl">Mailing Lists</CardTitle>
              <CardDescription>Join topic-based groups</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="groovy-button w-full">
                <Link href="/dashboard/mailing-lists">Browse Lists</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="groovy-card">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-secondary-foreground" />
              </div>
              <CardTitle className="font-serif text-xl">Friends</CardTitle>
              <CardDescription>Manage your connections</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="groovy-button w-full">
                <Link href="/dashboard/friends">View Friends</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="groovy-card">
            <CardHeader>
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="font-serif text-xl">Profile</CardTitle>
              <CardDescription>Update your info & privacy</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="groovy-button w-full">
                <Link href="/dashboard/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
