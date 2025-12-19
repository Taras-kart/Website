import React, { useEffect, useMemo, useState } from 'react'
import './Orders.css'
import { useNavigate } from 'react-router-dom'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

const STATUS_ORDER = ['Order Placed', 'Confirmed', 'Shipped', 'Out For Delivery', 'Delivered', 'RTO', 'Cancelled']

function normalizeStatus(s) {
  if (!s) return 'Order Placed'
  const t = String(s).toLowerCase()
  if (t.includes('cancel')) return 'Cancelled'
  if (t.includes('rto')) return 'RTO'
  if (t.includes('deliver')) return 'Delivered'
  if (t.includes('out for')) return 'Out For Delivery'
  if (t.includes('ship') || t.includes('dispatch') || t.includes('in transit')) return 'Shipped'
  if (t.includes('confirm') || t.includes('process') || t.includes('accept')) return 'Confirmed'
  return 'Order Placed'
}

function byStatusRank(a, b) {
  return STATUS_ORDER.indexOf(normalizeStatus(a.status)) - STATUS_ORDER.indexOf(normalizeStatus(b.status))
}

function firstItem(items) {
  if (!Array.isArray(items) || !items.length) return null
  return items[0] || null
}

function firstImg(items) {
  if (!Array.isArray(items) || !items.length) return ''
  const img = items.find((it) => it?.image_url)?.image_url || items[0]?.image_url || ''
  return typeof img === 'string' ? img : ''
}

function firstName(items) {
  const it = firstItem(items)
  if (!it) return ''
  return it?.product_name || it?.name || it?.title || ''
}

function firstBrand(items) {
  const it = firstItem(items)
  if (!it) return ''
  return it?.brand || it?.brand_name || it?.brandName || ''
}

function firstColor(items) {
  const it = firstItem(items)
  if (!it) return ''
  return it?.color || it?.colour || it?.variant_color || it?.variantColor || ''
}

const Orders = ({ user }) => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')

  const [loginEmail, setLoginEmail] = useState(sessionStorage.getItem('userEmail') || '')
  const [loginMobile, setLoginMobile] = useState(sessionStorage.getItem('userMobile') || '')

  useEffect(() => {
    const refreshFromStorage = () => {
      setLoginEmail(sessionStorage.getItem('userEmail') || '')
      setLoginMobile(sessionStorage.getItem('userMobile') || '')
    }
    refreshFromStorage()
    window.addEventListener('focus', refreshFromStorage)
    return () => window.removeEventListener('focus', refreshFromStorage)
  }, [])

  const email = (user?.email || loginEmail || '').trim()
  const mobile = (user?.phone || user?.mobile || loginMobile || '').trim()

  const money = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(n || 0))

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError('')
      try {
        if (!email && !mobile) {
          setOrders([])
          setLoading(false)
          return
        }

        const q = new URLSearchParams()
        if (email) q.set('email', email)
        if (mobile) q.set('mobile', mobile)

        const res = await fetch(`${API_BASE}/api/sales/web/by-user?${q.toString()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('bad')
        const data = await res.json()
        const list = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : []

        const mapped = list.map((s) => {
          const img = firstImg(s.items)
          const pname = firstName(s.items)
          const brand = firstBrand(s.items)
          const color = firstColor(s.items)
          const itemCount = Array.isArray(s.items) ? s.items.length : 0
          const st = normalizeStatus(s.status || 'PLACED')

          return {
            id: s.id,
            status: st,
            rawStatus: s.status || '',
            name: pname && itemCount > 1 ? `${pname} +${itemCount - 1}` : pname || 'Order',
            brand,
            color,
            image: img,
            offerPrice: Number(s?.totals?.payable ?? s?.total ?? 0),
            itemsCount: itemCount
          }
        })

        setOrders([...mapped].sort(byStatusRank))
      } catch {
        setOrders([])
        setError('Could not load your orders right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [email, mobile])

  const statusList = ['All', ...STATUS_ORDER]

  const filtered = useMemo(() => {
    if (filter === 'All') return orders
    return orders.filter((o) => o.status === filter)
  }, [orders, filter])

  if (!email && !mobile) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-empty-card">
            <h2 className="orders-empty-title">Sign in to see your orders</h2>
            <p className="orders-empty-subtitle">Use the same email or mobile you used at checkout.</p>
            <button className="btn-outline" onClick={() => navigate('/profile')}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-topbar skeleton-top">
            <div className="sk-h shimmer" />
            <div className="sk-s shimmer" />
          </div>
          <div className="skeleton-list">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="skeleton-card" key={i}>
                <div className="sk-img shimmer" />
                <div className="sk-body">
                  <div className="sk-line shimmer" />
                  <div className="sk-line short shimmer" />
                  <div className="sk-line tiny shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        {filtered.length === 0 ? (
          <div className="orders-empty-card">
            <img src="/images/no-order.svg" alt="No Orders" className="orders-empty-img" />
            <h2 className="orders-empty-title">No orders yet</h2>
            <p className="orders-empty-subtitle">Place an order and it will appear here.</p>
            <button className="btn-outline" onClick={() => navigate('/')}>
              Start Shopping
            </button>
            {error ? <p className="orders-error">{error}</p> : null}
          </div>
        ) : (
          <>
            <div className="orders-topbar">
              <div className="orders-header">
                <h3>Your Orders</h3>
                <span className="orders-count">{filtered.length}</span>
              </div>
              <div className="orders-actions">
                <div className="orders-filter">
                  <label>Status</label>
                  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    {statusList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="orders-list">
              {filtered.map((order) => {
                const st = order.status
                const statusClass = st.replace(/\s+/g, '-').toLowerCase()
                const isCancelled = st === 'Cancelled'
                return (
                  <div
                    key={order.id}
                    className={`orders-card ${isCancelled ? 'is-cancelled' : ''}`}
                    onClick={() => navigate(`/order/${order.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="orders-media">
                      {order.image ? (
                        <img src={order.image} alt={order.name || 'Item'} loading="lazy" />
                      ) : (
                        <div className="orders-ph" />
                      )}
                      <div className={`orders-badge orders-badge--${statusClass}`}>{st}</div>
                    </div>

                    <div className="orders-body">
                      <div className="orders-main">
                        {order.brand ? <div className="orders-brand">{order.brand}</div> : null}
                        <div className="orders-name">{order.name}</div>
                        {order.color ? (
                          <div className="orders-meta">
                            <span className="orders-meta-label">Color</span>
                            <span className="orders-meta-value">{order.color}</span>
                          </div>
                        ) : null}
                        <div className="orders-price">{money(order.offerPrice)}</div>
                      </div>

                      <div className="orders-actions-row" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-outline small" onClick={() => navigate(`/order/${order.id}`)}>
                          View
                        </button>
                        <button className="btn-outline small" onClick={() => navigate(`/order/${order.id}/tracking`)}>
                          Track
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {error ? (
              <div className="orders-inline-note">
                <span>{error}</span>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default Orders
