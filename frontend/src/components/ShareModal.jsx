import { useState } from 'react'
import { FiX, FiShare2, FiCopy, FiCheck, FiLink, FiMail, FiTrash2 } from 'react-icons/fi'
import { shareFile, removeShare } from '../api'
import toast from 'react-hot-toast'

export default function ShareModal({ file, onClose, onUpdate }) {
  const [emails, setEmails] = useState('')
  const [isPublic, setIsPublic] = useState(file.isPublic)
  const [shareLink, setShareLink] = useState(
    file.isPublic ? `http://localhost:5000/api/share/link/${file.shareLink}` : null
  )
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sharedWith, setSharedWith] = useState(file.sharedWith || [])

  const handleShare = async () => {
    setLoading(true)
    try {
      const emailList = emails.split(',').map(e => e.trim()).filter(Boolean)
      const res = await shareFile(file._id, {
        emails: emailList.length > 0 ? emailList : undefined,
        makePublic: isPublic,
      })
      const data = res.data.data
      if (data.shareLink) setShareLink(data.shareLink)
      if (data.sharedWith) setSharedWith(data.sharedWith)
      setEmails('')
      toast.success('File shared successfully!')
      onUpdate && onUpdate()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to share file')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublic = async (val) => {
    setIsPublic(val)
    try {
      const res = await shareFile(file._id, { makePublic: val })
      const data = res.data.data
      if (data.shareLink) setShareLink(data.shareLink)
      else setShareLink(null)
      onUpdate && onUpdate()
    } catch {
      toast.error('Failed to update sharing settings')
      setIsPublic(!val)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRemoveUser = async (userId) => {
    try {
      await removeShare(file._id, userId)
      setSharedWith(prev => prev.filter(u => u._id !== userId))
      toast.success('Access removed')
      onUpdate && onUpdate()
    } catch {
      toast.error('Failed to remove access')
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            <FiShare2 size={18} /> Share File
          </h2>
          <button className="modal-close" onClick={onClose} id="share-modal-close">
            <FiX />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          <strong style={{ color: 'var(--text-primary)' }}>{file.originalName}</strong>
        </p>

        {/* Public toggle */}
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Public Link Access</div>
            <div className="toggle-sublabel">Anyone with the link can download</div>
          </div>
          <label className="toggle" id="public-toggle">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => handleTogglePublic(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {/* Share link */}
        {shareLink && (
          <div className="share-section" style={{ marginTop: 16 }}>
            <span className="share-label"><FiLink size={12} /> Shareable Link</span>
            <div className="share-link-box">
              <span className="share-link-url">{shareLink}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleCopy} id="copy-link-btn">
                {copied ? <FiCheck size={13} color="var(--accent-green)" /> : <FiCopy size={13} />}
              </button>
            </div>
          </div>
        )}

        {/* Share with users */}
        <div className="share-section" style={{ marginTop: 20 }}>
          <span className="share-label"><FiMail size={12} /> Share with People</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="share-email-input"
              type="text"
              className="form-input"
              placeholder="email@example.com, email2@example.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handleShare}
              disabled={loading || (!emails.trim() && isPublic === file.isPublic)}
              id="share-submit-btn"
            >
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Share'}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Separate multiple emails with commas. Users must be registered.
          </p>
        </div>

        {/* Shared with list */}
        {sharedWith.length > 0 && (
          <div className="share-section" style={{ marginTop: 16 }}>
            <span className="share-label">Shared With</span>
            <div className="shared-users-list">
              {sharedWith.map((u) => (
                <div key={u._id} className="shared-user-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{u.username}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveUser(u._id)}
                    id={`remove-share-${u._id}`}
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onClose} id="share-done-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
