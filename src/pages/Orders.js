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

function normalizePayStatus(s) {
  const t = String(s || '').toUpperCase().trim()
  if (!t) return 'PENDING'
  if (t.includes('PAID')) return 'PAID'
  if (t.includes('COD')) return 'COD'
  if (t.includes('FAIL')) return 'FAILED'
  if (t.includes('PEND')) return 'PENDING'
  return t
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
          const payStatus = normalizePayStatus(s.payment_status)
          const isPendingOnline = payStatus === 'PENDING' || payStatus === 'FAILED'

          return {
            id: s.id,
            status: st,
            rawStatus: s.status || '',
            paymentStatus: payStatus,
            isPendingOnline,
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

  const statusList = ['All', ...STATUS_ORDER, 'Payment Pending']

  const filtered = useMemo(() => {
    if (filter === 'All') return orders
    if (filter === 'Payment Pending') return orders.filter((o) => o.isPendingOnline)
    return orders.filter((o) => o.status === filter)
  }, [orders, filter])

  if (!email && !mobile) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-hero">
            <div className="orders-hero-inner">
              <div className="orders-hero-title">Your Orders</div>
              <div className="orders-hero-sub">Sign in to view purchases, track shipments, and manage returns.</div>
              <button className="btn-primary" onClick={() => navigate('/profile')}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-topbar">
            <div className="sk-title shimmer" />
            <div className="sk-filter shimmer" />
          </div>

          <div className="orders-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="order-card skeleton" key={i}>
                <div className="order-img shimmer" />
                <div className="order-content">
                  <div className="sk-line shimmer" />
                  <div className="sk-line short shimmer" />
                  <div className="sk-line tiny shimmer" />
                  <div className="order-actions">
                    <div className="sk-btn shimmer" />
                    <div className="sk-btn shimmer" />
                  </div>
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
          <div className="orders-empty">
            <div className="orders-empty-card">
              <img src="/images/no-order.svg" alt="No Orders" className="orders-empty-img" />
              <div className="orders-empty-title">No orders found</div>
              <div className="orders-empty-subtitle">Once you place an order, it will show up here.</div>
              <button className="btn-primary" onClick={() => navigate('/')}>
                Start Shopping
              </button>
              {error ? <div className="orders-inline-error">{error}</div> : null}
            </div>
          </div>
        ) : (
          <>
            <div className="orders-topbar">
              <div className="orders-title-wrap">
                <div className="orders-title">Your Orders</div>
                <div className="orders-pill">{filtered.length}</div>
              </div>

              <div className="orders-right-tools">
                <div className="orders-filter">
                  <div className="orders-filter-label">Filter</div>
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

            <div className="orders-grid">
              {filtered.map((order) => {
                const label = order.isPendingOnline ? 'Payment Pending' : order.status
                const statusClass = label.replace(/\s+/g, '-').toLowerCase()
                const isCancelled = order.status === 'Cancelled'
                const blockTracking = order.isPendingOnline

                return (
                  <div
                    key={order.id}
                    className={`order-card ${isCancelled ? 'is-cancelled' : ''}`}
                    onClick={() => navigate(`/order/${order.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="order-media">
                      {order.image ? (
                        <img src={order.image} alt={order.name || 'Item'} loading="lazy" />
                      ) : (
                        <div className="order-img-fallback" />
                      )}
                      <div className={`order-badge order-badge--${statusClass}`}>{label}</div>
                    </div>

                    <div className="order-content">
                      <div className="order-row-top">
                        <div className="order-left">
                          {order.brand ? <div className="order-brand">{order.brand}</div> : null}
                          <div className="order-name">{order.name}</div>
                        </div>
                        <div className="order-price">{money(order.offerPrice)}</div>
                      </div>

                      <div className="order-meta">
                        {order.color ? (
                          <div className="order-meta-item">
                            <span className="order-meta-label">Color</span>
                            <span className="order-meta-value">{order.color}</span>
                          </div>
                        ) : null}

                        <div className="order-meta-item">
                          <span className="order-meta-label">Items</span>
                          <span className="order-meta-value">{order.itemsCount || 1}</span>
                        </div>

                        <div className="order-meta-item">
                          <span className="order-meta-label">Payment</span>
                          <span className={`order-meta-value ${order.paymentStatus === 'PAID' ? 'ok' : ''}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="order-actions" onClick={(e) => e.stopPropagation()}>
                        {order.isPendingOnline ? (
                          <button
                            className="btn-secondary"
                            onClick={() => navigate(`/payment?sale_id=${encodeURIComponent(order.id)}`)}
                          >
                            Continue Payment
                          </button>
                        ) : (
                          <button className="btn-secondary" onClick={() => navigate(`/order/${order.id}`)}>
                            View Details
                          </button>
                        )}

                        <button
                          className="btn-secondary"
                          disabled={blockTracking}
                          onClick={() => {
                            if (blockTracking) return
                            navigate(`/order/${order.id}/tracking`)
                          }}
                        >
                          {blockTracking ? 'Tracking Disabled' : 'Track Order'}
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
