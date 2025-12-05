import { convertToModelMessages, streamText } from "ai"
import { z } from "zod"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: "openai/gpt-4o",
    messages: convertToModelMessages(messages),
    system: `You are a helpful AI assistant for the "Circle Up!" community app. 
    You help users manage their community, coordinate events, and draft communications.
    You are friendly, professional, and efficient.`,
  })

  return result.toUIMessageStreamResponse()
}
