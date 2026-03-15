import { useState, useCallback } from 'react'
import { uploadDocument, listDocuments, deleteDocument } from '../api'

export function useDocuments() {
  const [documents, setDocuments]   = useState([])
  const [uploading, setUploading]   = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError]           = useState(null)

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await listDocuments()
      setDocuments(docs)
    } catch (err) {
      setError('Failed to fetch documents.')
    }
  }, [])

  const upload = useCallback(async (file) => {
    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const result = await uploadDocument(file, (e) => {
        if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100))
      })
      if (result.document) {
        setDocuments((prev) => [...prev, result.document])
      }
      return result
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed.'
      setError(msg)
      throw new Error(msg)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [])

  const remove = useCallback(async (docId) => {
    try {
      await deleteDocument(docId)
      setDocuments((prev) => prev.filter((d) => d.doc_id !== docId))
    } catch (err) {
      setError('Failed to delete document.')
    }
  }, [])

  return { documents, uploading, uploadProgress, error, upload, remove, fetchDocuments }
}
