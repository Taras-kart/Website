const API_BASE = String(import.meta.env?.VITE_API_BASE || process.env.REACT_APP_API_BASE || 'https://taras-kart-backend.vercel.app').replace(/\/+$/, '')

const getToken = () => sessionStorage.getItem('tk_id_token') || localStorage.getItem('tk_id_token') || sessionStorage.getItem('userToken') || localStorage.getItem('userToken') || ''

export async function apiRequest(path, options = {}) {
  const token = getToken()
  const response = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    cache: options.cache || 'no-store',
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    body: options.body && !(options.body instanceof FormData) && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || data.error || `Request failed (${response.status})`)
  return data
}

export { API_BASE }
