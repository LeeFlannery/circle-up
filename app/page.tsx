import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Heart, Users, Calendar, MessageCircle, Shield, Sparkles } from "@/lib/icons"

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen groovy-bg">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-primary groovy-text mb-6 transform -rotate-1 animate-on-load animate-bounce-in">
            Circle Up!
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-on-load animate-fade-in-up animate-delay-200">
            Secure community communication with complete privacy protection. Connect with your group members while
            keeping your personal information safe and secure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="groovy-button text-lg px-8 py-6 animate-on-load animate-slide-in-left animate-delay-400"
            >
              <Link href="/auth/signup">Join the Community</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-2 border-primary bg-transparent animate-on-load animate-slide-in-right animate-delay-400"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="groovy-card animate-on-load animate-fade-in-scale animate-delay-100">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 animate-float">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="font-serif text-2xl">Privacy First</CardTitle>
              <CardDescription className="text-base">
                Control who sees your info with granular privacy settings. Your data stays yours, always.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="groovy-card animate-on-load animate-fade-in-scale animate-delay-200">
            <CardHeader>
              <div
                className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4 animate-float"
                style={{ animationDelay: "0.5s" }}
              >
                <Users className="w-6 h-6 text-secondary-foreground" />
              </div>
              <CardTitle className="font-serif text-2xl">Member Directory</CardTitle>
              <CardDescription className="text-base">
                Connect with community members through a secure directory with friend-based visibility.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="groovy-card animate-on-load animate-fade-in-scale animate-delay-300">
            <CardHeader>
              <div
                className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <MessageCircle className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="font-serif text-2xl">Private Mailing Lists</CardTitle>
              <CardDescription className="text-base">
                Join topic-based groups and mailing lists with privacy protection built-in.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="groovy-card animate-on-load animate-fade-in-scale animate-delay-400">
            <CardHeader>
              <div
                className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 animate-float"
                style={{ animationDelay: "1.5s" }}
              >
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="font-serif text-2xl">Shared Calendar</CardTitle>
              <CardDescription className="text-base">
                Stay updated on group events and activities with our community calendar.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="groovy-card animate-on-load animate-fade-in-scale animate-delay-500">
            <CardHeader>
              <div
                className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4 animate-float"
                style={{ animationDelay: "2s" }}
              >
                <Heart className="w-6 h-6 text-secondary-foreground" />
              </div>
              <CardTitle className="font-serif text-2xl">Friends System</CardTitle>
              <CardDescription className="text-base">
                Build meaningful connections with a friend-request system that respects boundaries.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="groovy-card animate-on-load animate-fade-in-scale animate-delay-600">
            <CardHeader>
              <div
                className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4 animate-float"
                style={{ animationDelay: "2.5s" }}
              >
                <Sparkles className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="font-serif text-2xl">Beautiful Design</CardTitle>
              <CardDescription className="text-base">
                Experience community communication with a fun, vibrant aesthetic that brings joy to connecting.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="groovy-card max-w-2xl mx-auto animate-on-load animate-fade-in-up animate-delay-300">
            <CardContent className="p-8">
              <h2 className="font-serif text-3xl font-bold text-primary mb-4">Ready to Circle Up?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Join your community in a space that values both connection and privacy.
              </p>
              <Button asChild size="lg" className="groovy-button text-lg px-8 py-6">
                <Link href="/auth/signup">Start Connecting Today</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="border-t border-border bg-card/50 py-8 animate-on-load animate-fade-in-up animate-delay-500">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
              <a
                href="https://releasemode.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                A Release Mode Project
              </a>
            </div>
            <div>
              <a
                href="https://leeflannery.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                made by Lee @ fullstackdrip
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
