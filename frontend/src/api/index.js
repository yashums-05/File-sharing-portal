import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fv_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth APIs
export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')

// File APIs
export const uploadFile = (formData, onProgress) =>
  api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
    },
  })

export const getFiles = (q = '') => api.get(`/files${q ? `?q=${encodeURIComponent(q)}` : ''}`)
export const getFileById = (id) => api.get(`/files/${id}`)
export const deleteFile = (id) => api.delete(`/files/${id}`)
export const downloadFile = (id) => api.get(`/files/${id}/download`, { responseType: 'blob' })

// Share APIs
export const shareFile = (fileId, data) => api.post(`/share/${fileId}`, data)
export const removeShare = (fileId, userId) => api.delete(`/share/${fileId}/user/${userId}`)
export const getSharedWithMe = (q = '') => api.get(`/share/shared-with-me${q ? `?q=${encodeURIComponent(q)}` : ''}`)

export default api
