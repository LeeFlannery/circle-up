"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Loader2, Heart } from "@/lib/icons"

export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess("Check your email to confirm your account and start connecting!")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="groovy-card w-full max-w-md">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-secondary-foreground" />
        </div>
        <CardTitle className="font-serif text-3xl text-primary groovy-text">Join the Family!</CardTitle>
        <CardDescription className="text-base">Create your account and start connecting</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-accent bg-accent/10">
              <AlertDescription className="text-accent-foreground">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-base font-medium">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
                className="text-base py-3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-base font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
                className="text-base py-3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="text-base py-3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              className="text-base py-3"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full groovy-button text-lg py-6">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Join the Community"
            )}
          </Button>

          <div className="text-center text-muted-foreground">
            Already part of the family?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
