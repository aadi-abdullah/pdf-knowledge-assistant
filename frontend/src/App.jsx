import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import ChatInput from './components/ChatInput'
import { useDocuments } from './hooks/useDocuments'
import { useChat } from './hooks/useChat'

export default function App() {
  const [activeDocId, setActiveDocId] = useState(null)

  const {
    documents,
    uploading,
    uploadProgress,
    error: docError,
    upload,
    remove,
  } = useDocuments()

  const { messages, loading, sendMessage, clearChat } = useChat()

  const handleUpload = async (file) => {
    try {
      await upload(file)
    } catch (_) {
      // error already set in hook
    }
  }

  const activeDoc = documents.find((d) => d.doc_id === activeDocId)

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-950">
      <Header
        activeDoc={activeDoc?.filename}
        onClearChat={clearChat}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          documents={documents}
          uploading={uploading}
          uploadProgress={uploadProgress}
          error={docError}
          onUpload={handleUpload}
          onDelete={remove}
          activeDocId={activeDocId}
          onSelectDoc={setActiveDocId}
        />

        {/* Main Chat Area */}
        <main className="flex flex-col flex-1 overflow-hidden">
          <ChatWindow
            messages={messages}
            loading={loading}
            hasDocuments={documents.length > 0}
          />
          <ChatInput
            onSend={(q) => sendMessage(q, activeDocId)}
            loading={loading}
            disabled={documents.length === 0}
          />
        </main>
      </div>
    </div>
  )
}
