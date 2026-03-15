import { useState, useCallback, useRef } from 'react'
import { sendChatMessage } from '../api'

export function useChat() {
  const [messages, setMessages]   = useState([])   // {role, content, sources, model, tokens}
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const historyRef = useRef([])   // raw history for API (role + content only)

  const sendMessage = useCallback(async (question, docId = null) => {
    if (!question.trim() || loading) return

    const userMsg = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setError(null)

    try {
      const response = await sendChatMessage({
        question,
        docId,
        chatHistory: historyRef.current,
      })

      const assistantMsg = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources || [],
        model: response.model_used,
        tokens: response.tokens_used,
      }

      setMessages((prev) => [...prev, assistantMsg])

      // Update rolling history (keep last 10 turns for context)
      historyRef.current = [
        ...historyRef.current,
        { role: 'user', content: question },
        { role: 'assistant', content: response.answer },
      ].slice(-10)

    } catch (err) {
      const msg = err.response?.data?.detail || 'Something went wrong. Please try again.'
      setError(msg)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${msg}`, sources: [], isError: true },
      ])
    } finally {
      setLoading(false)
    }
  }, [loading])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
    historyRef.current = []
  }, [])

  return { messages, loading, error, sendMessage, clearChat }
}
