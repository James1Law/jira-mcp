"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu, Plus, MessageSquare, Send } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface JiraItem {
  key: string
  summary: string
  status: string
  priority: string
  issueType: string
}

interface GroupedItems {
  [key: string]: JiraItem[]
}

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  groupedItems?: GroupedItems
  actionableInsights?: string
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  lastUpdated: Date
}

export default function JiraAssistant() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [savedChats, setSavedChats] = useState<Chat[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Add a helper to handle suggested chat clicks
  const handleSuggestedChat = async (question: string) => {
    setInput(question)
    // Simulate a form submission with the question
    await new Promise((resolve) => setTimeout(resolve, 0)) // let input update
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent
    await handleSubmit(fakeEvent, question)
  }

  // Update handleSubmit to accept an optional overrideInput
  const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
    e.preventDefault()
    const value = overrideInput !== undefined ? overrideInput : input.trim()
    if (!value) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: value,
      timestamp: new Date(),
    }

    // Create new chat if none exists
    if (!currentChat) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: value.slice(0, 50) + (value.length > 50 ? "..." : ""),
        messages: [userMessage],
        lastUpdated: new Date(),
      }
      setCurrentChat(newChat)
    } else {
      setCurrentChat({
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
        lastUpdated: new Date(),
      })
    }

    setInput("")
    setIsLoading(true)

    // Real API call to backend
    try {
      const res = await fetch("/api/demo/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value })
      })
      const data = await res.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.answer || "Sorry, I couldn't find an answer.",
        timestamp: new Date(),
      }
      setCurrentChat((prev) => {
        if (!prev) return null
        const updatedChat = {
          ...prev,
          messages: [...prev.messages, assistantMessage],
          lastUpdated: new Date(),
        }
        // Update saved chats
        setSavedChats((prevChats) => {
          const existingIndex = prevChats.findIndex((chat) => chat.id === updatedChat.id)
          if (existingIndex >= 0) {
            const newChats = [...prevChats]
            newChats[existingIndex] = updatedChat
            return newChats
          }
          return [updatedChat, ...prevChats]
        })
        return updatedChat
      })
    } catch (err) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, there was an error contacting the server.",
        timestamp: new Date(),
      }
      setCurrentChat((prev) => {
        if (!prev) return null
        return {
          ...prev,
          messages: [...prev.messages, assistantMessage],
          lastUpdated: new Date(),
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startNewChat = () => {
    setCurrentChat(null)
    setSidebarOpen(false)
  }

  const selectChat = (chat: Chat) => {
    setCurrentChat(chat)
    setSidebarOpen(false)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button onClick={startNewChat} className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Chats</h3>
          {savedChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => selectChat(chat)}
              className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                currentChat?.id === chat.id ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 mt-1 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{chat.title}</p>
                  <p className="text-xs text-gray-500">{chat.lastUpdated.toLocaleDateString()}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-white border-r flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold text-gray-900">
            {currentChat ? currentChat.title : "James's Jira Bot"}
          </h1>
        </header>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {!currentChat ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to James's Jira Bot</h2>
                <p className="text-gray-600 mb-6">
                  Ask me anything about your Jira projects, tasks, and team progress.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  <button
                    onClick={() => handleSuggestedChat("What is Michael working on?")}
                    className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Team Status</div>
                    <div className="text-sm text-gray-600">What is Michael working on?</div>
                  </button>
                  <button
                    onClick={() => handleSuggestedChat("Show me high priority bugs")}
                    className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Priority Issues</div>
                    <div className="text-sm text-gray-600">Show me high priority bugs</div>
                  </button>
                  <button
                    onClick={() => handleSuggestedChat("What's ready for testing?")}
                    className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Testing Queue</div>
                    <div className="text-sm text-gray-600">What's ready for testing?</div>
                  </button>
                  <button
                    onClick={() => handleSuggestedChat("Sprint progress summary")}
                    className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Sprint Overview</div>
                    <div className="text-sm text-gray-600">Sprint progress summary</div>
                  </button>
                </div>
              </div>
            ) : (
              currentChat.messages.map((message) => (
                <div key={message.id} className="space-y-4">
                  {message.type === "user" ? (
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs md:max-w-md">
                        <p>{message.content}</p>
                        <p className="text-xs text-blue-100 mt-1">{formatTime(message.timestamp)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <Card className="max-w-full md:max-w-2xl">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }} />

                            {message.groupedItems && (
                              <div className="space-y-3">
                                {Object.entries(message.groupedItems).map(([groupName, items]) => (
                                  <div key={groupName} className="space-y-2">
                                    <h3 className="font-bold text-gray-900">{groupName}</h3>
                                    <ul className="space-y-2 ml-4">
                                      {items.map((item) => (
                                        <li key={item.key} className="space-y-1">
                                          <div className="flex items-start gap-2">
                                            <span className="text-blue-600 font-medium text-sm">{item.key}</span>
                                            <span className="text-gray-900 flex-1">{item.summary}</span>
                                          </div>
                                          <div className="text-xs text-gray-500 ml-6">
                                            {item.status} • {item.priority} • {item.issueType}
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            )}

                            {message.actionableInsights && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">💡</span>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Actionable Insights</h4>
                                    <p className="text-sm text-gray-700">{message.actionableInsights}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <p className="text-xs text-gray-400">{formatTime(message.timestamp)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <Card className="max-w-xs">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your Jira projects..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
