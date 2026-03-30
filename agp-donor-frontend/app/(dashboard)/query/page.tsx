"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, MessageSquare } from "lucide-react"
import { TopBar } from "@/components/dashboard/top-bar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isError?: boolean
}

const suggestedPrompts = [
  "Which campaign raised the most last quarter?",
  "Show me lapsed donors from Major Gifts",
  "What is the average gift by channel?",
]

export default function QueryPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText])

  const handleSubmit = async (query: string) => {
    if (!query.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setStreamingText("")

    let fullText = ""

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/ai-query`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: query.trim() }),
        }
      )

      if (!response.ok || !response.body) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value).split('\n\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const parsed = JSON.parse(line.replace('data: ', ''))
            if (parsed.done) break
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.token) {
              fullText += parsed.token
              setStreamingText(fullText)
            }
          } catch (parseErr: any) {
            if (parseErr?.message && !parseErr.message.includes('JSON')) {
              throw parseErr
            }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: fullText,
        },
      ])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: err?.message || "Failed to get a response. Please try again.",
          isError: true,
        },
      ])
    } finally {
      setStreamingText("")
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(input)
    }
  }

  const hasMessages = messages.length > 0

  const renderMessageContent = (content: string) =>
    content.split("\n").map((line, i) => {
      if (line.startsWith("| ")) {
        return (
          <code key={i} className="block text-xs bg-muted p-1 rounded">
            {line}
          </code>
        )
      }
      if (line.startsWith("- **")) {
        const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/)
        if (match) {
          return (
            <p key={i} className="my-1">
              <span className="font-semibold">{match[1]}</span>
              {match[2] ? `: ${match[2]}` : ""}
            </p>
          )
        }
      }
      if (line.match(/^\d+\./)) {
        return (
          <p key={i} className="my-1 pl-4">
            {line}
          </p>
        )
      }
      if (line.includes("**")) {
        const parts = line.split(/\*\*(.+?)\*\*/)
        return (
          <p key={i} className="my-2">
            {parts.map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j}>{part}</strong>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </p>
        )
      }
      if (line.trim()) {
        return (
          <p key={i} className="my-2">
            {line}
          </p>
        )
      }
      return null
    })

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar title="AI Query" />

      <div className="flex-1 flex flex-col">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {!hasMessages ? (
            // Empty state
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Ask a question about your donor data
              </h2>
              <p className="text-muted-foreground mb-8">
                Get instant insights powered by AI analysis of your donor records.
              </p>

              {/* Suggested prompts */}
              <div className="flex flex-wrap justify-center gap-3">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSubmit(prompt)}
                    className="px-4 py-2 text-sm rounded-full border border-border bg-card text-card-foreground hover:bg-muted transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Chat thread
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-5 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.isError
                          ? "bg-destructive/10 border border-destructive/30 text-destructive"
                          : "bg-card border border-border"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none text-card-foreground prose-headings:text-card-foreground prose-strong:text-card-foreground prose-p:text-card-foreground">
                        {renderMessageContent(message.content)}
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming response */}
              {isLoading && streamingText && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-5 py-3 bg-card border border-border">
                    <div className="prose prose-sm max-w-none text-card-foreground">
                      {streamingText.split("\n").map((line, i) => (
                        <p key={i} className="my-2">
                          {line}
                        </p>
                      ))}
                      <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Loading indicator (before first token) */}
              {isLoading && !streamingText && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-5 py-3 bg-card border border-border">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-sm text-muted-foreground">Analyzing your data...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-background p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            {hasMessages && (
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSubmit(prompt)}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs rounded-full border border-border bg-card text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your donor data..."
                rows={1}
                className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 pr-12 text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ minHeight: "52px", maxHeight: "200px" }}
              />
              <Button
                size="icon"
                onClick={() => handleSubmit(input)}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
