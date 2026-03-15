import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'

export default function SourceCard({ source, index }) {
  const [expanded, setExpanded] = useState(false)
  const scorePercent = Math.round(source.score * 100)

  return (
    <div className="source-card animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <BookOpen size={11} className="text-brand-400 shrink-0" />
          <span className="text-gray-300 font-medium truncate">{source.filename}</span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-500 shrink-0">Page {source.page}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Relevance badge */}
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
              scorePercent >= 80
                ? 'bg-green-500/20 text-green-400'
                : scorePercent >= 60
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {scorePercent}%
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-gray-600 hover:text-gray-300 transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {expanded && (
        <p className="mt-2 text-gray-400 leading-relaxed border-t border-gray-800 pt-2 text-[11px]">
          {source.chunk_text}
        </p>
      )}
    </div>
  )
}
