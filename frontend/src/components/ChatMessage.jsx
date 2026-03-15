import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, User, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { useState } from 'react'
import SourceCard from './SourceCard'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const [showSources, setShowSources] = useState(false)
  const hasSources = message.sources?.length > 0

  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-brand-500/20 border border-brand-500/30' : 'bg-gray-800 border border-gray-700'
      }`}>
        {isUser
          ? <User size={14} className="text-brand-400" />
          : <Bot size={14} className="text-gray-300" />
        }
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
        {isUser ? (
          <div className="message-user">
            <p className="text-sm text-gray-100">{message.content}</p>
          </div>
        ) : (
          <div className="message-ai">
            <div className="prose-ai text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Meta bar */}
            {(message.model || hasSources) && (
              <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center gap-3 flex-wrap">
                {message.model && (
                  <span className="flex items-center gap-1 text-[10px] text-gray-600">
                    <Zap size={9} className="text-yellow-500" />
                    {message.model}
                    {message.tokens && ` · ${message.tokens} tokens`}
                  </span>
                )}
                {hasSources && (
                  <button
                    onClick={() => setShowSources((v) => !v)}
                    className="ml-auto flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    {showSources ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sources panel */}
        {hasSources && showSources && (
          <div className="w-full space-y-1.5 pl-1">
            {message.sources.map((source, i) => (
              <SourceCard key={i} source={source} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
