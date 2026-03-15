import axios from 'axios'

const api = axios.create({
  baseURL: 'https://aadi-abdullah-pdf-knowledge-assistant.hf.space/api/v1',
  timeout: 60000, // RAG can be slow on first load
})

// ── Documents ──────────────────────────────────────────────────────────────

export const uploadDocument = async (file, onUploadProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
  return data
}

export const listDocuments = async () => {
  const { data } = await api.get('/documents/')
  return data
}

export const deleteDocument = async (docId) => {
  const { data } = await api.delete(`/documents/${docId}`)
  return data
}

// ── Chat ───────────────────────────────────────────────────────────────────

export const sendChatMessage = async ({ question, docId, chatHistory }) => {
  const { data } = await api.post('/chat/', {
    question,
    doc_id: docId || null,
    chat_history: chatHistory || [],
  })
  return data
}

export const checkHealth = async () => {
  const { data } = await api.get('/chat/health')
  return data
}
