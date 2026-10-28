import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { registerUser } from '../api'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.username) errs.username = 'Username is required'
    else if (form.username.length < 3) errs.username = 'At least 3 characters'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'At least 6 characters'
    if (!form.confirm) errs.confirm = 'Please confirm your password'
    else if (form.confirm !== form.password) errs.confirm = 'Passwords do not match'
    return errs
  }

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    setLoading(true)
    try {
      const res = await registerUser({ username: form.username, email: form.email, password: form.password })
      const { token, ...userData } = res.data.data
      login(userData, token)
      toast.success('Account created! Welcome to FileVault 🎉')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      toast.error(msg)
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  const inputIcon = (icon, field) => ({
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'
  })

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">📁</div>
          <h1>Create account</h1>
          <p>Join FileVault and start sharing files securely</p>
        </div>

        {errors.general && (
          <div className="alert alert-error">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} noValidate id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Username</label>
            <div style={{ position: 'relative' }}>
              <FiUser style={inputIcon()} />
              <input
                id="reg-username"
                name="username"
                type="text"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="johndoe"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
            {errors.username && <span className="form-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={inputIcon()} />
              <input
                id="reg-email"
                name="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={inputIcon()} />
              <input
                id="reg-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 40, paddingRight: 40 }}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                id="toggle-reg-password"
              >
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={inputIcon()} />
              <input
                id="reg-confirm"
                name="confirm"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
            {errors.confirm && <span className="form-error">{errors.confirm}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} id="register-submit-btn">
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
