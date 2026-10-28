import { useState, useEffect, useCallback } from 'react'
import { getSharedWithMe } from '../api'
import FileCard from '../components/FileCard'
import SearchBar from '../components/SearchBar'
import { FiShare2, FiRefreshCw } from 'react-icons/fi'

export default function SharedFiles() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchShared = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const res = await getSharedWithMe(q)
      setFiles(res.data.data)
    } catch {
      // silence
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchShared() }, [fetchShared])

  useEffect(() => {
    const t = setTimeout(() => fetchShared(search), 350)
    return () => clearTimeout(t)
  }, [search, fetchShared])

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <span className="gradient-text">Shared</span> With Me
          </h1>
          <p className="dashboard-subtitle">
            Files that other users have shared with you
          </p>

          <div className="dashboard-actions">
            <SearchBar value={search} onChange={setSearch} placeholder="Search shared files..." />
            <button className="btn btn-ghost" onClick={() => fetchShared(search)} title="Refresh" id="shared-refresh-btn">
              <FiRefreshCw size={15} />
            </button>
          </div>
        </div>

        <div className="section-header">
          <h2 className="section-title">
            <FiShare2 size={18} />
            {search ? `Results for "${search}"` : 'Shared Files'}
          </h2>
          {files.length > 0 && (
            <span className="badge badge-green">{files.length} file{files.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🤝</span>
            <h3>{search ? 'No files match your search' : 'Nothing shared with you yet'}</h3>
            <p>
              {search
                ? 'Try a different search term'
                : 'When someone shares a file with your email, it will appear here'}
            </p>
          </div>
        ) : (
          <div className="file-grid" id="shared-file-grid">
            {files.map(file => (
              <FileCard
                key={file._id}
                file={file}
                showOwner
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
