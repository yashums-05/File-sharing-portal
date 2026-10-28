import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getFiles } from '../api'
import FileCard from '../components/FileCard'
import SearchBar from '../components/SearchBar'
import UploadModal from '../components/UploadModal'
import ShareModal from '../components/ShareModal'
import { FiUploadCloud, FiFolder, FiShare2, FiHardDrive, FiRefreshCw } from 'react-icons/fi'

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Dashboard() {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [shareFile, setShareFile] = useState(null)

  const fetchFiles = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const res = await getFiles(q)
      setFiles(res.data.data)
    } catch {
      // silence
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchFiles(search), 350)
    return () => clearTimeout(t)
  }, [search, fetchFiles])

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)
  const sharedCount = files.filter(f => f.sharedWith?.length > 0 || f.isPublic).length

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            My Files <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong>{user?.username}</strong> · Manage and share your files
          </p>

          <div className="dashboard-actions">
            <SearchBar value={search} onChange={setSearch} />
            <button
              className="btn btn-primary"
              onClick={() => setShowUpload(true)}
              id="open-upload-btn"
            >
              <FiUploadCloud size={16} /> Upload Files
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => fetchFiles(search)}
              title="Refresh"
              id="refresh-btn"
            >
              <FiRefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon purple"><FiFolder size={20} /></div>
            <div>
              <div className="stat-label">Total Files</div>
              <div className="stat-value">{files.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FiHardDrive size={20} /></div>
            <div>
              <div className="stat-label">Storage Used</div>
              <div className="stat-value">{formatSize(totalSize)}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><FiShare2 size={20} /></div>
            <div>
              <div className="stat-label">Shared Files</div>
              <div className="stat-value">{sharedCount}</div>
            </div>
          </div>
        </div>

        {/* File Grid */}
        <div className="section-header">
          <h2 className="section-title">
            <FiFolder size={18} />
            {search ? `Results for "${search}"` : 'All Files'}
          </h2>
          {files.length > 0 && (
            <span className="badge badge-purple">{files.length} file{files.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📂</span>
            <h3>{search ? 'No files match your search' : 'No files yet'}</h3>
            <p>{search ? 'Try a different search term' : 'Upload your first file to get started'}</p>
            {!search && (
              <button className="btn btn-primary" onClick={() => setShowUpload(true)} id="empty-upload-btn">
                <FiUploadCloud size={16} /> Upload Files
              </button>
            )}
          </div>
        ) : (
          <div className="file-grid" id="file-grid">
            {files.map(file => (
              <FileCard
                key={file._id}
                file={file}
                onDelete={(id) => setFiles(prev => prev.filter(f => f._id !== id))}
                onShare={(f) => setShareFile(f)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => fetchFiles(search)}
        />
      )}
      {shareFile && (
        <ShareModal
          file={shareFile}
          onClose={() => setShareFile(null)}
          onUpdate={() => fetchFiles(search)}
        />
      )}
    </div>
  )
}
