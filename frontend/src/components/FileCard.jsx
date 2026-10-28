import { useNavigate } from 'react-router-dom'
import { FiDownload, FiTrash2, FiShare2, FiEye } from 'react-icons/fi'
import { downloadFile, deleteFile } from '../api'
import toast from 'react-hot-toast'

// File type icon + color mapping
const getFileStyle = (mimeType = '') => {
  if (mimeType.startsWith('image/')) return { icon: '🖼️', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' }
  if (mimeType === 'application/pdf') return { icon: '📄', color: '#f87171', bg: 'rgba(248,113,113,0.15)' }
  if (mimeType.includes('word')) return { icon: '📝', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' }
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return { icon: '📊', color: '#34d399', bg: 'rgba(52,211,153,0.15)' }
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return { icon: '📑', color: '#fb923c', bg: 'rgba(251,146,60,0.15)' }
  if (mimeType.startsWith('video/')) return { icon: '🎬', color: '#f472b6', bg: 'rgba(244,114,182,0.15)' }
  if (mimeType.startsWith('audio/')) return { icon: '🎵', color: '#22d3ee', bg: 'rgba(34,211,238,0.15)' }
  if (mimeType.includes('zip') || mimeType.includes('rar')) return { icon: '🗜️', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' }
  if (mimeType === 'text/plain') return { icon: '📃', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' }
  return { icon: '📁', color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' }
}

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric'
})

export default function FileCard({ file, onDelete, onShare, showOwner = false }) {
  const navigate = useNavigate()
  const style = getFileStyle(file.mimeType)

  const handleDownload = async (e) => {
    e.stopPropagation()
    try {
      const res = await downloadFile(file._id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = file.originalName
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Download started!')
    } catch {
      toast.error('Download failed')
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm(`Delete "${file.originalName}"?`)) return
    try {
      await deleteFile(file._id)
      toast.success('File deleted')
      onDelete && onDelete(file._id)
    } catch {
      toast.error('Failed to delete file')
    }
  }

  const handleShare = (e) => {
    e.stopPropagation()
    onShare && onShare(file)
  }

  return (
    <div
      className="file-card"
      onClick={() => navigate(`/files/${file._id}`)}
      role="button"
      tabIndex={0}
      id={`file-card-${file._id}`}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/files/${file._id}`)}
    >
      {file.isPublic && (
        <div className="file-card-shared-badge">
          <span className="badge badge-green">Public</span>
        </div>
      )}

      <div
        className="file-card-icon"
        style={{ background: style.bg, color: style.color }}
      >
        {style.icon}
      </div>

      <div className="file-card-name" title={file.originalName}>
        {file.originalName}
      </div>

      <div className="file-card-meta">
        <span>{formatSize(file.size)}</span>
        <span>•</span>
        <span>{formatDate(file.createdAt)}</span>
        {showOwner && file.owner && (
          <>
            <span>•</span>
            <span>by {file.owner.username}</span>
          </>
        )}
      </div>

      {file.sharedWith?.length > 0 && !showOwner && (
        <div style={{ marginBottom: 10 }}>
          <span className="badge badge-purple">
            Shared with {file.sharedWith.length}
          </span>
        </div>
      )}

      <div className="file-card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="btn btn-ghost btn-sm" onClick={handleDownload} title="Download" id={`download-${file._id}`}>
          <FiDownload size={13} /> Download
        </button>
        {!showOwner && (
          <>
            <button className="btn btn-ghost btn-sm" onClick={handleShare} title="Share" id={`share-${file._id}`}>
              <FiShare2 size={13} />
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete} title="Delete" id={`delete-${file._id}`}>
              <FiTrash2 size={13} />
            </button>
          </>
        )}
        {showOwner && (
          <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/files/${file._id}`) }} id={`view-${file._id}`}>
            <FiEye size={13} /> View
          </button>
        )}
      </div>
    </div>
  )
}
