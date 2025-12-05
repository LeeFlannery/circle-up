"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Loader2, Wand2 } from 'lucide-react'
import { draftEmail } from "@/app/actions/ai"
import { toast } from "sonner"

interface EmailAgentProps {
  onDraftGenerated: (subject: string, content: string) => void
  audienceName: string
}

export default function EmailAgent({ onDraftGenerated, audienceName }: EmailAgentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("friendly")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) return

    setIsGenerating(true)
    try {
      const content = await draftEmail(topic, audienceName, tone)
      // Simple heuristic to extract a subject line if the AI provided one, otherwise use the topic
      const subject = topic.charAt(0).toUpperCase() + topic.slice(1)
      
      onDraftGenerated(subject, content)
      setIsOpen(false)
      setTopic("")
      toast.success("Draft generated!")
    } catch (error) {
      console.error("Failed to generate draft:", error)
      toast.error("Could not generate draft. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-primary border-primary/20 hover:bg-primary/5">
          <Wand2 className="w-4 h-4" />
          Draft with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Email Assistant
          </DialogTitle>
          <DialogDescription>
            Describe what you want to say, and I'll write a draft for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic">What is this email about?</Label>
            <Input
              id="topic"
              placeholder="e.g., Reminder about the potluck next Friday"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Friendly & Warm</SelectItem>
                <SelectItem value="professional">Professional & Clear</SelectItem>
                <SelectItem value="urgent">Urgent & Important</SelectItem>
                <SelectItem value="celebratory">Celebratory & Fun</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !topic.trim()} 
            className="w-full groovy-button"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Writing Draft...
              </>
            ) : (
              "Generate Draft"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
