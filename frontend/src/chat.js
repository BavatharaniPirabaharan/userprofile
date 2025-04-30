import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './components/ui/button'
import { cn } from './lib/utils'
import axios from 'axios'
import ChatHistory from './components/ChatHistory'

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post('/api/chat', {
        message: userMessage.content,
        response: 'AI response will be here'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.response,
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your request.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-black">
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h1 className="text-xl text-white">AI Chat</h1>
        <Button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-white text-black hover:bg-white/90"
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </Button>
      </div>

      {showHistory ? (
        <div className="flex-1 overflow-y-auto">
          <ChatHistory />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={cn(
                    'flex w-full',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-4 py-2',
                      message.role === 'user'
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white'
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="mt-1 text-xs opacity-50">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg bg-white/10 px-4 py-2 text-white">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-white/50" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-white/50 [animation-delay:0.2s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-white/50 [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
            <div className="mx-auto max-w-3xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-white/50 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-white text-black hover:bg-white/90 disabled:opacity-50"
                >
                  Send
                </Button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  )
}