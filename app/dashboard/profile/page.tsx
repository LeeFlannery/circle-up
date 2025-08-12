import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import ProfileForm from "@/components/profile/profile-form"

export default async function ProfilePage() {
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
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-primary groovy-text mb-2">Your Profile</h1>
          <p className="text-lg text-muted-foreground">Manage your info and privacy settings</p>
        </div>
        <ProfileForm profile={profile} />
      </div>
    </DashboardLayout>
  )
}
