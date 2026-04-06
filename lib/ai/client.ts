import Anthropic from "@anthropic-ai/sdk"
import type { ModelConfig } from "./models"

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

type ChatMessage = { role: "user" | "assistant"; content: string }

/**
 * Stream tokens from Anthropic (Claude) as normalized SSE chunks.
 * Yields: `data: {"text":"..."}\n\n` and finally `data: [DONE]\n\n`
 */
export async function* streamAnthropic(opts: {
  model: string
  maxTokens: number
  system?: string
  messages: ChatMessage[]
}): AsyncGenerator<string> {
  const response = await anthropic.messages.stream({
    model: opts.model,
    max_tokens: opts.maxTokens,
    ...(opts.system ? { system: opts.system } : {}),
    messages: opts.messages,
  })

  for await (const chunk of response) {
    if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
      yield `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
    }
  }
  yield "data: [DONE]\n\n"
}

/**
 * Stream tokens from OpenAI (GPT-4-turbo / GPT-3.5-turbo) as normalized SSE chunks.
 * Uses native fetch so no extra package is required.
 */
export async function* streamOpenAI(opts: {
  model: string
  maxTokens: number
  system?: string
  messages: ChatMessage[]
}): AsyncGenerator<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured")

  const openaiMessages: { role: string; content: string }[] = []
  if (opts.system) {
    openaiMessages.push({ role: "system", content: opts.system })
  }
  openaiMessages.push(...opts.messages)

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens,
      messages: openaiMessages,
      stream: true,
    }),
  })

  if (!res.ok || !res.body) {
    const errText = await res.text()
    throw new Error(`OpenAI API error ${res.status}: ${errText}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed === "data: [DONE]") continue
      if (!trimmed.startsWith("data: ")) continue

      try {
        const json = JSON.parse(trimmed.slice(6)) as {
          choices: { delta: { content?: string } }[]
        }
        const content = json.choices[0]?.delta?.content
        if (content) {
          yield `data: ${JSON.stringify({ text: content })}\n\n`
        }
      } catch {
        // Malformed chunk — skip
      }
    }
  }

  yield "data: [DONE]\n\n"
}

/**
 * Unified stream dispatcher — picks Anthropic or OpenAI based on ModelConfig.
 */
export function streamModel(opts: {
  config: ModelConfig
  system?: string
  messages: ChatMessage[]
}): AsyncGenerator<string> {
  if (opts.config.provider === "openai") {
    return streamOpenAI({
      model: opts.config.model,
      maxTokens: opts.config.maxTokens,
      system: opts.system,
      messages: opts.messages,
    })
  }
  return streamAnthropic({
    model: opts.config.model,
    maxTokens: opts.config.maxTokens,
    system: opts.system,
    messages: opts.messages,
  })
}
