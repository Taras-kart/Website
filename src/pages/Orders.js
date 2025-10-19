// src/pages/Orders.js
import React, { useEffect, useMemo, useState } from 'react'
import './Orders.css'
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa'
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
  const [expanded, setExpanded] = useState(null)
  const [tracking, setTracking] = useState({})
  const [trackLoading, setTrackLoading] = useState({})
  const [error, setError] = useState('')

  const loginEmail = useMemo(() => sessionStorage.getItem('userEmail') || '', [])
  const loginMobile = useMemo(() => sessionStorage.getItem('userMobile') || '', [])

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
          const res = await fetch(`${API_BASE}/api/sales/web/by-user?${q.toString()}`, {
            headers: { 'Cache-Control': 'no-cache' }
          })
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
            name:
              pname && itemCount > 1
                ? `${pname} +${itemCount - 1}`
                : pname || `Order #${s.id}`,
            image: img,
            thumbs: (Array.isArray(s.items) ? s.items : []).slice(0, 3).map(it => ({
              src: it.image_url || '',
              alt: it.product_name || 'Item'
            })),
            offerPrice: Number(s?.totals?.payable ?? s?.total ?? 0),
            originalPrice: null
          }
        })

        setOrders(mapped.sort(byStatusRank))
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

  const fetchTracking = async order => {
    if (!order?.id) return
    if (tracking[order.id]) {
      setExpanded(expanded === order.id ? null : order.id)
      return
    }
    setTrackLoading(m => ({ ...m, [order.id]: true }))
    setExpanded(order.id)
    try {
      const res = await fetch(`${API_BASE}/api/shipments/by-sale/${encodeURIComponent(order.id)}`)
      const rows = await res.json()
      const shipments = Array.isArray(rows) ? rows : []
      setTracking(m => ({ ...m, [order.id]: { shipments } }))
    } catch {
      setTracking(m => ({ ...m, [order.id]: { error: true, shipments: [] } }))
    } finally {
      setTrackLoading(m => ({ ...m, [order.id]: false }))
    }
  }

  const statusList = ['All', ...STATUS_ORDER]

  if (!email && !mobile) {
    return (
      <div className="orders-container">
        <div className="orders-empty-card">
          <div className="empty-orb"></div>
          <h2 className="orders-empty-title">Sign in to see your orders</h2>
          <p className="orders-empty-subtitle">Use the same email or mobile you used at checkout.</p>
          <button className="orders-start-button" onClick={() => navigate('/profile')}>Sign In</button>
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
          <div className="empty-orb"></div>
          <img src="/images/no-order.svg" alt="No Orders" className="orders-empty-img" />
          <h2 className="orders-empty-title">No orders yet</h2>
          <p className="orders-empty-subtitle">Place an order and it will appear here.</p>
          <button className="orders-start-button" onClick={() => navigate('/')}>Start Shopping</button>
          {error ? <p className="orders-error">{error}</p> : null}
        </div>
      ) : (
        <>
          <div className="orders-topbar">
            <div className="orders-header">
              <h3>Your Orders</h3>
              <span className="orders-count">{orders.length}</span>
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
              const isOpen = expanded === order.id
              const t = tracking[order.id]
              const shipments = t?.shipments || []
              const firstTrack = shipments.find(s => s.tracking_url)?.tracking_url || ''

              return (
                <div key={order.id} className={`orders-item ${isOpen ? 'open' : ''}`}>
                  <span className="orders-glow"></span>

                  <div className={`orders-badge ${st.replace(/\s/g, '').toLowerCase()}`}>
                    <FaCheckCircle />
                    <span>{st}</span>
                  </div>

                  <div className="orders-image" onClick={() => navigate(`/track/${order.id}`)}>
                    {order.thumbs?.length ? (
                      <div className="thumbs">
                        {order.thumbs.map((t, idx) => (
                          <img key={idx} src={t.src} alt={t.alt || 'Item'} loading="lazy" />
                        ))}
                        {Array.isArray(order.thumbs) && order.thumbs.length === 3 ? <div className="thumbs-more">+more</div> : null}
                      </div>
                    ) : (
                      <div className="orders-ph" />
                    )}
                  </div>

                  <div className="orders-info">
                    <div className="orders-row">
                      <h4 className="orders-name">{order.name}</h4>
                      <div className="orders-brand">TARS KART</div>
                    </div>

                    <div className="orders-meta">
                      <div className="orders-price">
                        <span className="price-current">{formatPrice(order.offerPrice)}</span>
                        {order.originalPrice ? <span className="price-original">{formatPrice(order.originalPrice)}</span> : null}
                      </div>
                      <p className="orders-date">{order.date}</p>
                    </div>

                    <div className="orders-cta">
                      <button className="btn-secondary" onClick={() => navigate(`/track/${order.id}`)}>View</button>
                      <button className="btn-primary" onClick={() => fetchTracking(order)} disabled={trackLoading[order.id]}>
                        {trackLoading[order.id] ? 'Loading…' : isOpen ? 'Hide Shipments' : 'Show Shipments'}
                      </button>
                      {firstTrack ? (
                        <a className="btn-link" href={firstTrack} target="_blank" rel="noreferrer">Open Tracking</a>
                      ) : null}
                    </div>

                    {isOpen ? (
                      <div className="orders-tracking">
                        {t?.error ? (
                          <div className="orders-track-empty"><p>Tracking unavailable right now.</p></div>
                        ) : shipments.length === 0 && trackLoading[order.id] ? (
                          <div className="orders-track-empty"><p>Fetching shipments…</p></div>
                        ) : shipments.length === 0 ? (
                          <div className="orders-track-empty"><p>No shipments yet.</p></div>
                        ) : (
                          <div className="ship-rows">
                            {shipments.map(s => (
                              <div className="ship-row" key={s.id}>
                                <div><span>Branch</span><strong>#{s.branch_id}</strong></div>
                                <div><span>AWB</span><strong>{s.awb || '-'}</strong></div>
                                <div><span>Status</span><strong>{String(s.status || 'CREATED').toUpperCase()}</strong></div>
                                <div className="ship-actions">
                                  {s.tracking_url ? <a className="btn-link" href={s.tracking_url} target="_blank" rel="noreferrer">Track</a> : null}
                                  {s.label_url ? <a className="btn-primary" href={s.label_url} target="_blank" rel="noreferrer">Label</a> : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="orders-arrow" onClick={() => fetchTracking(order)}>
                    <FaArrowRight />
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
