"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, MessageSquare, Database } from "lucide-react"
import { TopBar } from "@/components/dashboard/top-bar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  recordsUsed?: number
}

const suggestedPrompts = [
  "Which campaign raised the most last quarter?",
  "Show me lapsed donors from Major Gifts",
  "What is the average gift by channel?",
]

// Mock responses based on queries
const getMockResponse = (query: string): { text: string; recordsUsed: number } => {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes("campaign") && lowerQuery.includes("most")) {
    return {
      text: `Based on your donor data, the **Year End Appeal** campaign raised the most last quarter with a total of **$82,000** from 285 donors.\n\nHere's the breakdown of all campaigns from Q4:\n\n- **Year End Appeal**: $82,000 (285 donors)\n- **Spring Campaign**: $61,000 (198 donors)\n- **Giving Tuesday**: $44,000 (156 donors)\n- **Monthly Giving**: $35,500 (142 donors)\n- **Emergency Fund**: $26,000 (98 donors)\n\nThe Year End Appeal outperformed other campaigns by 34% compared to the second-highest performer.`,
      recordsUsed: 197,
    }
  }

  if (lowerQuery.includes("lapsed") && lowerQuery.includes("major")) {
    return {
      text: `I found **23 lapsed donors** who were previously categorized as Major Gifts donors.\n\nKey insights:\n\n- **Total potential value**: $287,500 (based on their last gifts)\n- **Average last gift**: $12,500\n- **Average time since last gift**: 18 months\n- **Most common last campaign**: Year End Appeal (14 donors)\n\nTop 5 lapsed Major Gift donors by last gift amount:\n\n1. Robert Chen - $50,000 (last gift: Jan 2025)\n2. Patricia Williams - $35,000 (last gift: Nov 2024)\n3. James Anderson - $28,000 (last gift: Dec 2024)\n4. Margaret Thompson - $25,000 (last gift: Oct 2024)\n5. William Davis - $22,000 (last gift: Sep 2024)\n\nConsider a personalized outreach campaign to re-engage these high-value donors.`,
      recordsUsed: 197,
    }
  }

  if (lowerQuery.includes("average") && lowerQuery.includes("channel")) {
    return {
      text: `Here's the **average gift amount by channel** from your donor data:\n\n| Channel | Average Gift | Total Donors | Total Raised |\n|---------|-------------|--------------|---------------|\n| Phone | $285.50 | 105 | $29,978 |\n| Direct Mail | $178.25 | 407 | $72,548 |\n| Email | $124.00 | 790 | $97,960 |\n| Web | $96.00 | 500 | $48,000 |\n\n**Key insights:**\n\n- Phone solicitation yields the highest average gift, but has the lowest volume\n- Email has the highest total raised due to volume\n- Direct Mail performs well in both average gift and volume\n- Web donations have the lowest average but are growing month-over-month`,
      recordsUsed: 197,
    }
  }

  // Default response
  return {
    text: `Based on your donor database, I analyzed the relevant records to answer your question.\n\nHere's what I found:\n\n- **Total donors in database**: 2,001\n- **Total raised**: $248,500\n- **Average gift size**: $124.25\n- **Retention rate**: 68.4%\n\nYour donor segments are distributed as follows:\n- Major Gifts: 45%\n- Mid-Level: 30%\n- Lapsed: 15%\n- New Donors: 10%\n\nWould you like me to dive deeper into any specific aspect of your donor data?`,
    recordsUsed: 197,
  }
}

export default function QueryPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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

    // Simulate streaming response
    const response = getMockResponse(query)
    const chars = response.text.split("")

    for (let i = 0; i < chars.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 8))
      setStreamingText((prev) => prev + chars[i])
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.text,
      recordsUsed: response.recordsUsed,
    }

    setMessages((prev) => [...prev, assistantMessage])
    setStreamingText("")
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(input)
    }
  }

  const hasMessages = messages.length > 0

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
                        : "bg-card border border-border"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="space-y-4">
                        <div className="prose prose-sm max-w-none text-card-foreground prose-headings:text-card-foreground prose-strong:text-card-foreground prose-p:text-card-foreground">
                          {message.content.split("\n").map((line, i) => {
                            if (line.startsWith("| ")) {
                              // Table handling
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
                          })}
                        </div>
                        {message.recordsUsed && (
                          <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <Database className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Data context used: {message.recordsUsed} donor records
                            </span>
                          </div>
                        )}
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

              {/* Loading state */}
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
                ref={inputRef}
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
