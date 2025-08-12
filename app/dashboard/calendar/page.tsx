import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import CalendarView from "@/components/calendar/calendar-view"

export default async function CalendarPage() {
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
          <h1 className="font-serif text-4xl font-bold text-primary groovy-text mb-2">Church Calendar</h1>
          <p className="text-lg text-muted-foreground">Stay updated on all church events and activities</p>
        </div>
        <CalendarView currentUserId={user.id} userRole={profile?.role || "member"} />
      </div>
    </DashboardLayout>
  )
}
