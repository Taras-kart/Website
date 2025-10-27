// src/pages/Orders.js
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
  if (t.includes('deliver')) return 'Delivered'
  if (t.includes('out for')) return 'Out For Delivery'
  if (t.includes('ship')) return 'Shipped'
  if (t.includes('confirm')) return 'Confirmed'
  if (t.includes('rto')) return 'RTO'
  if (t.includes('cancel')) return 'Cancelled'
  return 'Order Placed'
}

function byStatusRank(a, b) {
  return STATUS_ORDER.indexOf(normalizeStatus(a.status)) - STATUS_ORDER.indexOf(normalizeStatus(b.status))
}

function firstImg(items) {
  if (!Array.isArray(items) || !items.length) return ''
  const img = items.find(it => it?.image_url)?.image_url || ''
  return typeof img === 'string' ? img : ''
}

function firstName(items) {
  if (!Array.isArray(items) || !items.length) return ''
  return items[0]?.product_name || ''
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

  const email = user?.email || loginEmail || ''
  const mobile = user?.phone || user?.mobile || loginMobile || ''

  const formatPrice = v =>
    typeof v === 'number'
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)
      : v

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError('')
      try {
        let list = []
        if (email || mobile) {
          const q = new URLSearchParams()
          if (email) q.set('email', email)
          if (mobile) q.set('mobile', mobile)
          const res = await fetch(`${API_BASE}/api/sales/web/by-user?${q.toString()}`, { cache: 'no-store' })
          if (!res.ok) throw new Error('bad')
          const data = await res.json()
          list = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : []
        } else {
          setLoading(false)
          setOrders([])
          return
        }
        const mapped = list.map(s => {
          const img = firstImg(s.items)
          const pname = firstName(s.items)
          const itemCount = Array.isArray(s.items) ? s.items.length : 0
          return {
            id: s.id,
            status: s.status || 'PLACED',
            date: s.created_at ? new Date(s.created_at).toLocaleString('en-IN') : '',
            name: pname && itemCount > 1 ? `${pname} +${itemCount - 1}` : pname || `Order #${s.id}`,
            image: img,
            thumbs: (Array.isArray(s.items) ? s.items : []).slice(0, 3).map(it => ({
              src: it.image_url || '',
              alt: it.product_name || 'Item'
            })),
            offerPrice: Number(s?.totals?.payable ?? s?.total ?? 0),
            originalPrice: null
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

  const filtered = useMemo(() => {
    if (filter === 'All') return orders
    return orders.filter(o => normalizeStatus(o.status) === filter)
  }, [orders, filter])

  const statusList = ['All', ...STATUS_ORDER]

  if (!email && !mobile) {
    return (
      <div className="orders-container">
        <div className="orders-empty-card">
          <h2 className="orders-empty-title">Sign in to see your orders</h2>
          <p className="orders-empty-subtitle">Use the same email or mobile you used at checkout.</p>
          <button className="btn-outline" onClick={() => navigate('/profile')}>Sign In</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="orders-container">
        <div className="skeleton-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <div className="skeleton-item" key={i}>
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
    )
  }

  return (
    <div className="orders-container">
      {filtered.length === 0 ? (
        <div className="orders-empty-card">
          <img src="/images/no-order.svg" alt="No Orders" className="orders-empty-img" />
          <h2 className="orders-empty-title">No orders yet</h2>
          <p className="orders-empty-subtitle">Place an order and it will appear here.</p>
          <button className="btn-outline" onClick={() => navigate('/')}>Start Shopping</button>
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
                <select value={filter} onChange={e => setFilter(e.target.value)}>
                  {statusList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="orders-list">
            {filtered.map(order => {
              const st = normalizeStatus(order.status)
              return (
                <div key={order.id} className="orders-item">
                  <div className="orders-image" onClick={() => navigate(`/order/${order.id}`)}>
                    {order.thumbs?.length ? (
                      <div className="thumbs">
                        {order.thumbs.map((t, idx) => (
                          <img key={idx} src={t.src} alt={t.alt || 'Item'} loading="lazy" />
                        ))}
                      </div>
                    ) : (
                      <div className="orders-ph" />
                    )}
                  </div>

                  <div className="orders-info">
                    <div className="orders-row">
                      <h4 className="orders-name">{order.name}</h4>
                      <span className="orders-badge">{st}</span>
                    </div>

                    <div className="orders-meta">
                      <div className="orders-price">
                        <span className="price-current">{formatPrice(order.offerPrice)}</span>
                      </div>
                      <p className="orders-date">{order.date}</p>
                    </div>

                    <div className="orders-cta">
                      <button className="btn-outline" onClick={() => navigate(`/order/${order.id}`)}>View</button>
                      <button className="btn-outline" onClick={() => navigate(`/order/${order.id}/tracking`)}>Track Order</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default Orders
