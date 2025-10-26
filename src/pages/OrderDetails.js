// src/pages/OrderDetails.js
import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import './OrderDetails.css'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const orderId = useMemo(() => id || '', [id])
  const [sale, setSale] = useState(null)
  const [shipments, setShipments] = useState([])
  const [eligibility, setEligibility] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const [sRes, shRes, elRes, rrRes] = await Promise.all([
        fetch(`${API_BASE}/api/sales/web/${encodeURIComponent(orderId)}`),
        fetch(`${API_BASE}/api/shipments/by-sale/${encodeURIComponent(orderId)}`),
        fetch(`${API_BASE}/api/returns/eligibility/${encodeURIComponent(orderId)}`),
        fetch(`${API_BASE}/api/returns/by-sale/${encodeURIComponent(orderId)}`)
      ])
      const s = await sRes.json().catch(() => null)
      const sh = await shRes.json().catch(() => [])
      const el = await elRes.json().catch(() => null)
      const rr = await rrRes.json().catch(() => ({ rows: [] }))
      setSale(s)
      setShipments(Array.isArray(sh) ? sh : [])
      setEligibility(el)
      setRequests(Array.isArray(rr?.rows) ? rr.rows : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    const t = setInterval(fetchAll, 20000)
    return () => clearInterval(t)
  }, [orderId])

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0))
  const statusText = (s) => {
    const v = String(s || '').toLowerCase()
    if (v.includes('deliver')) return 'Delivered'
    if (v.includes('out for')) return 'Out For Delivery'
    if (v.includes('ship')) return 'Shipped'
    if (v.includes('confirm')) return 'Confirmed'
    if (v.includes('rto')) return 'RTO'
    if (v.includes('cancel')) return 'Cancelled'
    return 'Order Placed'
  }

  return (
    <div className="order-details-page">
      <Navbar />
      <div className="order-details-wrap">
        <div className="od-header">
          <button className="btn back" onClick={() => navigate(-1)}>← Back</button>
          <h1>Order</h1>
          <div className="od-chip">#{orderId}</div>
          <div className="od-actions-top">
            <button className="btn solid" onClick={fetchAll}>Refresh</button>
            <button className="btn ghost" onClick={() => navigate(`/order/${orderId}/tracking`)}>Track Order</button>
          </div>
        </div>

        {loading ? (
          <div className="od-loader">
            <div className="od-spin" />
            <span>Loading…</span>
          </div>
        ) : !sale ? (
          <div className="od-empty">Order not found</div>
        ) : (
          <div className="od-grid">
            <div className="od-main">
              <div className="od-card">
                <div className="od-stats">
                  <div className="kv">
                    <span>Status</span>
                    <strong className="gold">{statusText(sale?.status)}</strong>
                  </div>
                  <div className="kv">
                    <span>Payment</span>
                    <strong>{String(sale?.payment_status || 'COD').toUpperCase()}</strong>
                  </div>
                  <div className="kv">
                    <span>Total</span>
                    <strong>{fmt(sale?.totals?.payable ?? sale?.total)}</strong>
                  </div>
                </div>
              </div>

              <div className="od-card">
                <div className="od-section-title">Items</div>
                <div className="od-items">
                  {Array.isArray(sale?.items) && sale.items.length ? (
                    sale.items.map((it, idx) => (
                      <div className="od-item" key={`${it.variant_id}-${idx}`}>
                        <div className="thumb">
                          {it.image_url ? <img src={it.image_url} alt="" /> : <div className="ph" />}
                        </div>
                        <div className="meta">
                          <div className="name">{it.name || `Variant #${it.variant_id}`}</div>
                          <div className="bits">
                            <span>EAN {it.ean_code || '-'}</span>
                            <span>Size {it.size || '-'}</span>
                            <span>Colour {it.colour || '-'}</span>
                          </div>
                        </div>
                        <div className="qty">x{it.qty}</div>
                        <div className="price">{fmt(it.price)}</div>
                      </div>
                    ))
                  ) : (
                    <div className="od-empty">No items</div>
                  )}
                </div>
              </div>

              <div className="od-card">
                <div className="od-section-title">Shipments</div>
                <div className="od-shipments">
                  {shipments.length === 0 ? (
                    <div className="od-empty">No shipments yet. Please check back shortly.</div>
                  ) : (
                    shipments.map((sh) => (
                      <div className="ship-card" key={sh.id}>
                        <div className="ship-row">
                          <div className="ship-kv">
                            <span>Branch</span>
                            <strong>#{sh.branch_id}</strong>
                          </div>
                          <div className="ship-kv">
                            <span>AWB</span>
                            <strong>{sh.awb || '-'}</strong>
                          </div>
                          <div className="ship-kv">
                            <span>Status</span>
                            <strong className="gold">{String(sh.status || 'CREATED').toUpperCase()}</strong>
                          </div>
                        </div>
                        <div className="ship-actions">
                          {sh.tracking_url ? (
                            <a className="btn ghost" href={sh.tracking_url} target="_blank" rel="noreferrer">Track</a>
                          ) : null}
                          {sh.label_url ? (
                            <a className="btn solid" href={sh.label_url} target="_blank" rel="noreferrer">Label</a>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="od-side">
              <div className="od-card">
                <div className="od-section-title">Customer</div>
                <div className="kv">
                  <span>Name</span>
                  <strong>{sale?.customer_name || 'Customer'}</strong>
                </div>
                <div className="kv">
                  <span>Mobile</span>
                  <strong>{sale?.customer_mobile || '-'}</strong>
                </div>
                <div className="kv">
                  <span>Pincode</span>
                  <strong>{sale?.shipping_address?.pincode || '-'}</strong>
                </div>
                <div className="kv">
                  <span>Address</span>
                  <strong className="wrap">
                    {sale?.shipping_address?.line1 || sale?.shipping_address || '-'}
                    {sale?.shipping_address?.line2 ? `, ${sale?.shipping_address?.line2}` : ''}
                    {sale?.shipping_address?.city ? `, ${sale?.shipping_address?.city}` : ''}
                    {sale?.shipping_address?.state ? `, ${sale?.shipping_address?.state}` : ''}
                  </strong>
                </div>
              </div>

              <div className="od-card">
                <div className="od-section-title">Returns & Replacements</div>
                {eligibility?.ok ? (
                  <div className="od-ret-actions">
                    <a className="btn solid wide" href={`/returns?saleId=${encodeURIComponent(orderId)}&type=RETURN`}>Request Return</a>
                    <a className="btn ghost wide" href={`/returns?saleId=${encodeURIComponent(orderId)}&type=REPLACE`}>Request Replacement</a>
                  </div>
                ) : (
                  <div className="od-note">{eligibility?.reason ? `Not eligible: ${eligibility.reason}` : 'Eligibility not available'}</div>
                )}
                {Array.isArray(requests) && requests.length ? (
                  <div className="od-rr-list">
                    {requests.map(r => (
                      <div className="od-rr-row" key={r.id}>
                        <div className="rr-kv"><span>Type</span><strong>{r.type}</strong></div>
                        <div className="rr-kv"><span>Status</span><strong>{String(r.status || '').toUpperCase()}</strong></div>
                        <div className="rr-kv"><span>Reason</span><strong>{r.reason || '-'}</strong></div>
                        <div className="rr-kv"><span>Created</span><strong>{r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : '-'}</strong></div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
