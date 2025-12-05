"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2 } from 'lucide-react'
import { parseEventFromText } from "@/app/actions/ai"
import { toast } from "sonner"

interface CalendarAgentProps {
  onEventParsed: (event: any) => void
}

export default function CalendarAgent({ onEventParsed }: CalendarAgentProps) {
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSmartAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsProcessing(true)
    try {
      const eventDetails = await parseEventFromText(input)
      onEventParsed(eventDetails)
      setInput("")
      toast.success("Event details extracted!")
    } catch (error) {
      console.error("Failed to parse event:", error)
      toast.error("Could not understand event details. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="groovy-card bg-primary/5 border-primary/20 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Smart Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSmartAdd} className="flex gap-2">
          <Input
            placeholder="e.g., 'Potluck dinner next Friday at 6pm in the Community Hall'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-background"
            disabled={isProcessing}
          />
          <Button type="submit" disabled={isProcessing} className="groovy-button shrink-0">
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Thinking...
              </>
            ) : (
              "Draft Event"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
