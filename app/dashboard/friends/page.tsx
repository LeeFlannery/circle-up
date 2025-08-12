import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import FriendsView from "@/components/friends/friends-view"

export default async function FriendsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-primary groovy-text mb-2">Your Friends</h1>
          <p className="text-lg text-muted-foreground">Manage your church family connections</p>
        </div>
        <FriendsView currentUserId={user.id} />
      </div>
    </DashboardLayout>
  )
}
