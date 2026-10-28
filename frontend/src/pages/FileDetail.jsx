import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFileById, downloadFile, deleteFile } from '../api'
import ShareModal from '../components/ShareModal'
import { FiDownload, FiTrash2, FiShare2, FiArrowLeft, FiCalendar, FiHardDrive, FiUser, FiLink } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

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
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await getFileById(id)
        setFile(res.data.data)
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 403) setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchFile()
  }, [id])

  const handleDownload = async () => {
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

  const handleDelete = async () => {
    if (!confirm(`Delete "${file.originalName}"?`)) return
    try {
      await deleteFile(file._id)
      toast.success('File deleted')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to delete file')
    }
  }

  if (loading) return (
    <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
    </div>
  )

  if (notFound) return (
    <div className="page-wrapper">
      <div className="container">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <span className="empty-state-icon">🚫</span>
          <h3>File not found</h3>
          <p>This file doesn't exist or you don't have access to it.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')} id="back-to-dashboard-btn">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )

  const style = getFileStyle(file?.mimeType)
  const isOwner = file?.owner?._id === user?._id || file?.owner === user?._id

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Back button */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(-1)}
          style={{ marginTop: 24 }}
          id="back-btn"
        >
          <FiArrowLeft size={14} /> Back
        </button>

        {/* Hero */}
        <div className="file-detail-hero">
          <div className="file-detail-icon" style={{ background: style.bg, color: style.color }}>
            {style.icon}
          </div>
          <div className="file-detail-info">
            <h1>{file.originalName}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <span className="badge badge-purple">{file.mimeType}</span>
              {file.isPublic && <span className="badge badge-green">🔗 Public</span>}
              {file.sharedWith?.length > 0 && (
                <span className="badge badge-orange">Shared with {file.sharedWith.length}</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handleDownload} id="detail-download-btn">
                <FiDownload size={15} /> Download
              </button>
              {isOwner && (
                <>
                  <button className="btn btn-ghost" onClick={() => setShowShare(true)} id="detail-share-btn">
                    <FiShare2 size={15} /> Share
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete} id="detail-delete-btn">
                    <FiTrash2 size={15} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Meta grid */}
        <div className="file-meta-grid">
          <div className="file-meta-item">
            <div className="file-meta-key"><FiHardDrive size={11} /> File Size</div>
            <div className="file-meta-val">{formatSize(file.size)}</div>
          </div>
          <div className="file-meta-item">
            <div className="file-meta-key"><FiCalendar size={11} /> Uploaded</div>
            <div className="file-meta-val">
              {new Date(file.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div className="file-meta-item">
            <div className="file-meta-key"><FiUser size={11} /> Owner</div>
            <div className="file-meta-val">{file.owner?.username || 'You'}</div>
          </div>
          {file.isPublic && (
            <div className="file-meta-item">
              <div className="file-meta-key"><FiLink size={11} /> Share Link</div>
              <div className="file-meta-val" style={{ fontSize: '0.78rem', wordBreak: 'break-all', color: 'var(--accent-secondary)' }}>
                {`http://localhost:5000/api/share/link/${file.shareLink}`}
              </div>
            </div>
          )}
        </div>

        {/* Shared with list */}
        {isOwner && file.sharedWith?.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              <FiShare2 size={16} /> Shared With
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
              {file.sharedWith.map(u => (
                <div
                  key={u._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', background: 'var(--bg-card)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                    {u.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{u.username}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showShare && (
        <ShareModal
          file={file}
          onClose={() => setShowShare(false)}
          onUpdate={async () => {
            const res = await getFileById(id)
            setFile(res.data.data)
          }}
        />
      )}
    </div>
  )
}
