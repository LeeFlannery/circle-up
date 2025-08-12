import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import MailingListDetail from "@/components/mailing-lists/mailing-list-detail"

interface MailingListPageProps {
  params: {
    id: string
  }
}

export default async function MailingListPage({ params }: MailingListPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get mailing list details
  const { data: mailingList, error } = await supabase
    .from("mailing_lists")
    .select(`
      *,
      user_profiles!mailing_lists_created_by_fkey(first_name, last_name)
    `)
    .eq("id", params.id)
    .single()

  if (error || !mailingList) {
    notFound()
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

  // Check if user can access this list
  const canAccess =
    mailingList.privacy_level === "public" ||
    mailingList.created_by === user.id ||
    (mailingList.privacy_level === "leaders" && (profile?.role === "leader" || profile?.role === "admin")) ||
    (mailingList.privacy_level === "admin" && profile?.role === "admin")

  if (!canAccess) {
    redirect("/dashboard/mailing-lists")
  }

  return (
    <DashboardLayout>
      <MailingListDetail mailingList={mailingList} currentUserId={user.id} userRole={profile?.role || "member"} />
    </DashboardLayout>
  )
}
