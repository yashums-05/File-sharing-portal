import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiX, FiUploadCloud, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { uploadFile } from '../api'
import toast from 'react-hot-toast'

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadModal({ onClose, onSuccess }) {
  const [files, setFiles] = useState([])   // { file, progress, status, error }
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((accepted, rejected) => {
    const newFiles = accepted.map(f => ({ file: f, progress: 0, status: 'pending', error: null }))
    setFiles(prev => [...prev, ...newFiles])
    if (rejected.length > 0) toast.error(`${rejected.length} file(s) rejected (type/size limit)`)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024,
  })

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    let successCount = 0

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'done') { successCount++; continue }
      const formData = new FormData()
      formData.append('file', files[i].file)

      try {
        await uploadFile(formData, (progress) => {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, progress } : f))
        })
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done', progress: 100 } : f))
        successCount++
      } catch (err) {
        const msg = err.response?.data?.message || 'Upload failed'
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', error: msg } : f))
      }
    }

    setUploading(false)
    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded!`)
      onSuccess && onSuccess()
      setTimeout(onClose, 1000)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Upload Files</h2>
          <button className="modal-close" onClick={onClose} id="upload-modal-close" aria-label="Close modal">
            <FiX />
          </button>
        </div>

        {/* Dropzone */}
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`} id="upload-dropzone">
          <input {...getInputProps()} id="file-input" />
          <span className="dropzone-icon">
            <FiUploadCloud size={40} color="var(--accent-primary)" />
          </span>
          <h3>{isDragActive ? 'Drop files here!' : 'Drag & drop files here'}</h3>
          <p>or <span className="accent">click to browse</span> · Max 50MB per file</p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="upload-progress-container">
            {files.map((item, idx) => (
              <div key={idx} className="upload-file-item">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="upload-file-name">{item.file.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                      {formatSize(item.file.size)}
                    </span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className="progress-bar"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  {item.error && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-red)', marginTop: 4 }}>
                      {item.error}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8, flexShrink: 0 }}>
                  {item.status === 'done' && <FiCheckCircle color="var(--accent-green)" size={16} />}
                  {item.status === 'error' && <FiAlertCircle color="var(--accent-red)" size={16} />}
                  {item.status === 'pending' && !uploading && (
                    <button
                      onClick={() => removeFile(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      aria-label="Remove file"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose} disabled={uploading} id="upload-cancel-btn">
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            id="upload-submit-btn"
          >
            {uploading ? (
              <><span className="spinner" /> Uploading...</>
            ) : (
              <><FiUploadCloud size={15} /> Upload {files.length > 0 ? `(${files.length})` : ''}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
