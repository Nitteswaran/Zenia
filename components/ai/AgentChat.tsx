"use client"

import * as React from "react"
import { Bot, User, Send, Trash2, Mic, Copy, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const SUGGESTED_PROMPTS = [
  "Write a LinkedIn post about the future of AI in marketing",
  "Give me 5 content ideas for Instagram this week",
  "What are the best times to post on LinkedIn for B2B?",
  "Create a 3-email welcome sequence for new leads",
  "Analyze my marketing strategy and suggest improvements",
]

export function AgentChat() {
  const { toast } = useToast()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    const history = [...messages, userMsg]
    setMessages(history)
    setInput("")
    setIsStreaming(true)

    const assistantId = crypto.randomUUID()
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }
    setMessages([...history, assistantMsg])

    try {
      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to get response")
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break
            try {
              const parsed = JSON.parse(data) as { text: string }
              accumulated += parsed.text
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, content: accumulated } : m)
              )
            } catch { /* ignore parse errors */ }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong"
      toast({ variant: "destructive", title: "Error", description: errorMessage })
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const clearConversation = () => {
    setMessages([])
  }

  return (
    <div className="flex h-full flex-col border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-accent flex items-center justify-center">
            <Bot className="h-3.5 w-3.5 text-accent-foreground" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium">Zenia AI</span>
          <span className="text-xs text-muted-foreground font-mono">claude-sonnet-4</span>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearConversation}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
            <div className="h-12 w-12 bg-accent flex items-center justify-center">
              <Bot className="h-6 w-6 text-accent-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-medium tracking-tight">How can I help you today?</h2>
              <p className="text-muted-foreground text-sm mt-2">I can generate content, manage campaigns, analyse data, and execute marketing tasks.</p>
            </div>
            <div className="w-full max-w-lg space-y-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left border border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 hover:bg-muted transition-all duration-150"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="h-7 w-7 shrink-0 bg-accent flex items-center justify-center mt-0.5">
                  <Bot className="h-4 w-4 text-accent-foreground" strokeWidth={1.5} />
                </div>
              )}
              <div className={cn("max-w-[80%] space-y-1.5", msg.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-muted text-foreground border border-border"
                      : "bg-transparent text-foreground"
                  )}
                >
                  {msg.content}
                  {msg.role === "assistant" && isStreaming && msg.id === messages[messages.length - 1]?.id && !msg.content && (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-muted-foreground text-xs">Thinking...</span>
                    </span>
                  )}
                  {msg.role === "assistant" && isStreaming && msg.id === messages[messages.length - 1]?.id && msg.content && (
                    <span className="inline-block w-0.5 h-4 bg-accent animate-pulse ml-0.5" />
                  )}
                </div>
                {msg.role === "assistant" && msg.content && (
                  <button
                    onClick={() => copyMessage(msg.id, msg.content)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <><Check className="h-3 w-3" /> Copied</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Copy</>
                    )}
                  </button>
                )}
              </div>
              {msg.role === "user" && (
                <div className="h-7 w-7 shrink-0 bg-muted border border-border flex items-center justify-center text-xs font-mono mt-0.5">
                  <User className="h-4 w-4" strokeWidth={1.5} />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = "auto"
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Zenia to generate content, schedule posts, analyse campaigns..."
              disabled={isStreaming}
              rows={1}
              className="w-full resize-none border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-accent transition-colors disabled:opacity-50 min-h-[48px] max-h-[200px]"
              style={{ overflow: "hidden" }}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="h-12 w-12 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Voice input"
            >
              <Mic className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="h-12 w-12 bg-accent flex items-center justify-center text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center font-mono">
          Enter to send · Shift+Enter for new line · 1 AI credit per message
        </p>
      </div>
    </div>
  )
}
