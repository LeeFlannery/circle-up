"use server"

import { generateObject, generateText } from "ai"
import { z } from "zod"

// Schema for calendar event parsing
const eventSchema = z.object({
  title: z.string().describe("The title of the event"),
  description: z.string().describe("A brief description of the event"),
  startDate: z.string().describe("ISO 8601 start date and time"),
  endDate: z.string().describe("ISO 8601 end date and time"),
  location: z.string().optional().describe("The location of the event"),
  isPublic: z.boolean().describe("Whether the event is public or private"),
})

export async function parseEventFromText(text: string) {
  const { object } = await generateObject({
    model: "openai/gpt-4o",
    schema: eventSchema,
    prompt: `Extract calendar event details from the following text: "${text}". 
    If no year is specified, assume the current year. 
    If no duration is specified, assume 1 hour.`,
  })

  return object
}

export async function draftEmail(topic: string, audience: string, tone: string = "friendly") {
  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt: `Draft a ${tone} email to ${audience} about "${topic}". 
    Keep it concise and engaging. 
    Use placeholders like [Name] where appropriate.`,
  })

  return text
}

export async function suggestMeetingTimes(constraints: string) {
  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt: `Suggest 3 optimal meeting times based on these constraints: "${constraints}".
    Format the output as a clean list.`,
  })

  return text
}
