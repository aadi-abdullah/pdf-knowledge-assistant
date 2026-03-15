import { useEffect, useRef } from 'react'
import { Bot, Sparkles, FileSearch } from 'lucide-react'
import ChatMessage from './ChatMessage'

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
        <Bot size={14} className="text-gray-300" />
      </div>
      <div className="message-ai flex items-center gap-1 py-3.5 px-4">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}

function EmptyState({ hasDocuments }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
        {hasDocuments ? <FileSearch size={28} className="text-brand-400" /> : <Sparkles size={28} className="text-brand-400" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-200 mb-2">
        {hasDocuments ? 'Ready to answer questions' : 'Upload a PDF to begin'}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm">
        {hasDocuments
          ? "Ask anything about your documents. I'll retrieve the most relevant sections and generate an accurate answer."
          : "Drop a PDF in the sidebar. I'll chunk it, embed it, and make it searchable using RAG."}
      </p>
      {hasDocuments && (
        <div className="mt-6 flex flex-col gap-2 w-full max-w-sm">
          {['Summarize the main findings', 'What are the key conclusions?', 'List all recommendations mentioned'].map((q) => (
            <div key={q} className="text-xs text-gray-500 glass rounded-lg px-3 py-2 text-left hover:border-gray-600 cursor-default transition-colors">
              💬 {q}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ChatWindow({ messages, loading, hasDocuments }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <EmptyState hasDocuments={hasDocuments} />
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
