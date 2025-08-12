import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import MessagesView from "@/components/messages/messages-view"

export default async function MessagesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-primary groovy-text mb-2">Messages & Announcements</h1>
          <p className="text-lg text-muted-foreground">Stay connected with your church community</p>
        </div>
        <MessagesView currentUserId={user.id} userRole={profile?.role || "member"} />
      </div>
    </DashboardLayout>
  )
}
