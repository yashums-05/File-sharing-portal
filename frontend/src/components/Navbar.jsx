import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiUploadCloud, FiFolder, FiShare2, FiLogOut } from 'react-icons/fi'

export default function Navbar({ onUploadClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="navbar-logo">
          <div className="logo-icon">📁</div>
          <span className="gradient-text">FileVault</span>
        </NavLink>

        <div className="navbar-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FiFolder size={16} /> My Files
          </NavLink>
          <NavLink to="/shared" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FiShare2 size={16} /> Shared With Me
          </NavLink>
        </div>

        <div className="navbar-user">
          <div className="user-avatar" title={user?.username}>
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
