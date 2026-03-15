import { useRef, useState } from 'react'
import { FileText, Upload, Trash2, X, ChevronRight, Database, Loader2, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

export default function Sidebar({ documents, uploading, uploadProgress, error, onUpload, onDelete, activeDocId, onSelectDoc }) {
  const fileRef    = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = (files) => {
    const pdf = Array.from(files).find((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (pdf) onUpload(pdf)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <aside className="w-72 h-full glass flex flex-col border-r border-gray-800/60 shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/60">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center">
            <Database size={14} className="text-brand-500" />
          </div>
          <h2 className="font-semibold text-sm">Knowledge Base</h2>
        </div>
        <p className="text-xs text-gray-500">{documents.length} document{documents.length !== 1 ? 's' : ''} indexed</p>
      </div>

      {/* Upload area */}
      <div className="p-3">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200',
            dragging
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/40',
            uploading && 'cursor-not-allowed opacity-60'
          )}
        >
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFiles(e.target.files)} />

          {uploading ? (
            <div className="space-y-2">
              <Loader2 size={20} className="mx-auto text-brand-500 animate-spin" />
              <p className="text-xs text-gray-400">Indexing… {uploadProgress}%</p>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div
                  className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload size={18} className="mx-auto mb-2 text-gray-500" />
              <p className="text-xs font-medium text-gray-400">Drop PDF or click to upload</p>
              <p className="text-[10px] text-gray-600 mt-0.5">Max 20 MB</p>
            </>
          )}
        </div>

        {error && (
          <div className="mt-2 flex items-start gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            <AlertCircle size={12} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
        {/* "All Documents" option */}
        <button
          onClick={() => onSelectDoc(null)}
          className={clsx(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-150',
            activeDocId === null
              ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
              : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
          )}
        >
          <Database size={13} />
          <span className="font-medium">All Documents</span>
          {activeDocId === null && <ChevronRight size={12} className="ml-auto" />}
        </button>

        {documents.map((doc) => (
          <div
            key={doc.doc_id}
            onClick={() => onSelectDoc(doc.doc_id)}
            className={clsx(
              'group relative flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-all duration-150',
              activeDocId === doc.doc_id
                ? 'bg-brand-500/20 border border-brand-500/30'
                : 'hover:bg-gray-800/60 border border-transparent'
            )}
          >
            <FileText size={13} className={clsx('mt-0.5 shrink-0', activeDocId === doc.doc_id ? 'text-brand-400' : 'text-gray-500')} />
            <div className="flex-1 min-w-0">
              <p className={clsx('font-medium truncate', activeDocId === doc.doc_id ? 'text-brand-200' : 'text-gray-300')}>
                {doc.filename}
              </p>
              <p className="text-gray-600 mt-0.5">{doc.page_count} pages · {doc.chunk_count} chunks</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(doc.doc_id) }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 text-gray-600 transition-all"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}

        {documents.length === 0 && !uploading && (
          <div className="text-center py-8 text-gray-600">
            <FileText size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">No documents yet</p>
          </div>
        )}
      </div>
    </aside>
  )
}
