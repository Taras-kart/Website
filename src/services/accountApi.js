import { apiRequest } from './api'

const value = key => sessionStorage.getItem(key) || localStorage.getItem(key) || ''
export const sessionUser = () => ({ id: value('userId'), email: value('userEmail'), name: value('userName'), mobile: value('userMobile'), type: value('userType') || 'B2C' })

export function storeUser(data = {}) {
  const user = data.user || data
  const fields = { userId: user.id || user.uid, userEmail: user.email, userName: user.name || user.displayName, userMobile: user.mobile || user.phone, userType: user.type || user.userType || 'B2C', userToken: data.token || user.token }
  Object.entries(fields).forEach(([key, item]) => { if (item !== undefined && item !== null && item !== '') { sessionStorage.setItem(key, String(item)); localStorage.setItem(key, String(item)) } })
  return user
}

export function clearUser() {
  ;['userId','userEmail','userName','userMobile','userType','userToken','tk_id_token','firebaseUid'].forEach(key => { sessionStorage.removeItem(key); localStorage.removeItem(key) })
}

export const login = body => apiRequest('/api/auth/login', { method: 'POST', body })
export const signup = body => apiRequest('/api/b2c-customers/signup', { method: 'POST', body })
export const fetchUser = email => apiRequest(`/api/user/by-email/${encodeURIComponent(email)}`)
export const updateMobile = body => apiRequest('/api/user/update-mobile', { method: 'POST', body })
export const fetchWallet = email => apiRequest(`/api/coins/wallet?email=${encodeURIComponent(email)}`)
export const fetchOrders = user => apiRequest(`/api/sales/web/by-user?${new URLSearchParams({ ...(user.email ? { email: user.email } : {}), ...(user.mobile ? { mobile: user.mobile } : {}) })}`)
export const fetchOrder = id => apiRequest(`/api/sales/web/${encodeURIComponent(id)}`)
export const fetchShipments = id => apiRequest(`/api/shipments/by-sale/${encodeURIComponent(id)}`)
export const fetchReturnEligibility = id => apiRequest(`/api/returns/eligibility/${encodeURIComponent(id)}`)
export const fetchReturnsBySale = id => apiRequest(`/api/returns/by-sale/${encodeURIComponent(id)}`)
export const cancelOrder = body => apiRequest('/api/orders/cancel', { method: 'POST', body })
export const trackShipment = (id, channel = '') => apiRequest(`/api/shiprocket/track/${encodeURIComponent(id)}${channel ? `/${encodeURIComponent(channel)}` : ''}`)

export async function createReturn(body) {
  let failure
  for (const path of ['/api/returns', '/api/returns/request']) {
    try { return await apiRequest(path, { method: 'POST', body }) } catch (reason) { failure = reason }
  }
  throw failure || new Error('Unable to create return request')
}

export const money = value => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const statusLabel = value => {
  const status = String(value || '').toLowerCase()
  if (status.includes('cancel')) return 'Cancelled'
  if (status.includes('deliver')) return 'Delivered'
  if (status.includes('out for')) return 'Out for delivery'
  if (status.includes('ship') || status.includes('transit') || status.includes('dispatch')) return 'Shipped'
  if (status.includes('confirm') || status.includes('process') || status.includes('pack')) return 'Confirmed'
  return 'Order placed'
}
