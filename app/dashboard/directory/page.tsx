import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import MemberDirectory from "@/components/directory/member-directory"

export default async function DirectoryPage() {
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
          <h1 className="font-serif text-4xl font-bold text-primary groovy-text mb-2">Member Directory</h1>
          <p className="text-lg text-muted-foreground">Connect with your church family</p>
        </div>
        <MemberDirectory currentUserId={user.id} />
      </div>
    </DashboardLayout>
  )
}
