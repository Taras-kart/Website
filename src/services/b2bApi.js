import { apiRequest } from './api'

export async function fetchBranches() {
  let failure
  for (const path of ['/api/branches', '/api/branch']) {
    try {
      const data = await apiRequest(path)
      const rows = Array.isArray(data) ? data : data.branches || data.rows || []
      if (rows.length) return rows
    } catch (reason) { failure = reason }
  }
  if (failure) return []
  return []
}

export async function fetchB2BProducts(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value !== '' && value !== null && value !== undefined) query.set(key, String(value)) })
  const data = await apiRequest(`/api/b2b/products?${query}`)
  return Array.isArray(data) ? data : data.products || data.rows || []
}

export const placeB2BOrder = body => apiRequest('/api/sales/web/b2b-place', { method: 'POST', body })

export const wholesalePrice = product => {
  const original = Number(product.original_price_b2b || product.mrp || product.original_price_b2c || 0)
  const explicit = Number(product.final_price_b2b || product.sale_price || 0)
  const markdown = Number(product.markdown_pct || 0)
  const final = explicit || (markdown ? Math.round(original * (1 - Math.abs(markdown) / 100)) : original)
  return { original, final }
}

export const productImage = product => product.image_url || product.front_image_url || product.main_image_url || (Array.isArray(product.images) ? product.images[0]?.url || product.images[0] : '') || '/images/women/women20.jpeg'
export const money = value => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
export const b2bUser = () => ({ id: sessionStorage.getItem('userId') || localStorage.getItem('userId') || '', name: sessionStorage.getItem('userName') || localStorage.getItem('userName') || 'Wholesale customer', email: sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail') || '', mobile: sessionStorage.getItem('userMobile') || localStorage.getItem('userMobile') || '', type: String(sessionStorage.getItem('userType') || localStorage.getItem('userType') || '').toUpperCase() })

export function readB2BBasket() {
  try { const data=JSON.parse(sessionStorage.getItem('tara_b2b_basket')||'[]');return Array.isArray(data)?data:[] } catch { return [] }
}

export function writeB2BBasket(items) {
  sessionStorage.setItem('tara_b2b_basket', JSON.stringify(items))
  window.dispatchEvent(new CustomEvent('b2b-basket-updated', { detail: items.length }))
}
