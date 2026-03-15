import { useState, useRef } from 'react'
import { Send, Loader2 } from 'lucide-react'

export default function ChatInput({ onSend, loading, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || loading || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChange = (e) => {
    setValue(e.target.value)
    // Auto-grow textarea
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
    }
  }

  return (
    <div className="p-4 border-t border-gray-800/60 bg-gray-950/80 backdrop-blur-sm">
      <div className="flex items-end gap-3 glass rounded-2xl px-4 py-3 focus-within:border-brand-500/40 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Upload a PDF to start chatting…' : 'Ask anything about your documents…'}
          disabled={disabled || loading}
          rows={1}
          className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-600
                     resize-none outline-none leading-relaxed
                     disabled:cursor-not-allowed disabled:opacity-50"
          style={{ maxHeight: '160px' }}
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || loading || disabled}
          className="btn-primary rounded-xl px-3 py-2 shrink-0"
        >
          {loading
            ? <Loader2 size={16} className="animate-spin" />
            : <Send size={16} />
          }
        </button>
      </div>
      <p className="text-center text-[10px] text-gray-700 mt-2">
  Press <kbd className="bg-gray-800 px-1 rounded">Enter</kbd> to send ·&nbsp;
  <kbd className="bg-gray-800 px-1 rounded">Shift+Enter</kbd> for new line
  &nbsp;·&nbsp;
  <a href="https://www.linkedin.com/in/aadi-abdullah" target="_blank" rel="noopener noreferrer"
     className="text-gray-600 hover:text-brand-400 transition-colors">
    Built by Abdullah Shafique
  </a>
</p>
    </div>
  )
}
