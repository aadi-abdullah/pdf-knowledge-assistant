import { Trash2, BrainCircuit, Github, FileText, Linkedin } from 'lucide-react'

export default function Header({ activeDoc, onClearChat }) {
  return (
    <header className="h-14 glass border-b border-gray-800/60 flex items-center px-4 gap-4 shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
          <BrainCircuit size={16} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm leading-none">PDF Knowledge Assistant</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">RAG · Groq · FAISS</p>
        </div>
      </div>

      {/* Active doc indicator */}
      {activeDoc && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full ml-2">
          <FileText size={11} className="text-brand-400" />
          <span className="text-xs text-brand-300 truncate max-w-[180px]">{activeDoc}</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1">
        {/* Built by badge */}
        <a
          href="https://www.linkedin.com/in/aadi-abdullah"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full
                     bg-blue-500/10 border border-blue-500/20 hover:border-blue-400/40
                     transition-colors text-[11px] text-blue-300 font-medium"
        >
          <span>Built by Abdullah Shafique</span>
        </a>

        {/* GitHub link */}
        <a
          href="https://github.com/aadi-abdullah/pdf-knowledge-assistant"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          <Github size={14} />
          <span className="hidden sm:inline">GitHub</span>
        </a>

        {/* Clear chat */}
        <button onClick={onClearChat} className="btn-ghost">
          <Trash2 size={14} />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </header>
  )
}