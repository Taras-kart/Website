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

function toUpper(s) {
  return String(s || '').toUpperCase()
}

function isCancelledStatus(status) {
  const s = String(status || '').toLowerCase()
  return s.includes('cancel')
}

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const orderId = useMemo(() => id || '', [id])

  const [sale, setSale] = useState(null)
  const [saleItems, setSaleItems] = useState([])
  const [shipments, setShipments] = useState([])
  const [eligibility, setEligibility] = useState(null)
  const [requests, setRequests] = useState([])
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshedAt, setRefreshedAt] = useState('')

  const fetchProductViaEAN = async (ean) => {
    try {
      const r = await fetch(`${API_BASE}/api/products/by-ean/${encodeURIComponent(ean)}`)
      if (!r.ok) return null
      return await r.json()
    } catch {
      return null
    }
  }

  const fetchProductViaId = async (pid) => {
    try {
      const r = await fetch(`${API_BASE}/api/products/${encodeURIComponent(pid)}`)
      if (!r.ok) return null
      return await r.json()
    } catch {
      return null
    }
  }

  const enrichItems = async (items) => {
    const list = Array.isArray(items) ? items : []
    const enriched = await Promise.all(
      list.map(async (it) => {
        const ean = it?.ean_code || it?.ean || it?.barcode
        const pid = it?.variant_id || it?.product_id
        let d = null
        if (ean) d = await fetchProductViaEAN(ean)
        if (!d && pid) d = await fetchProductViaId(pid)
        const name = it?.product_name || it?.name || d?.product_name || d?.name
        const brand = it?.brand_name || it?.brand || d?.brand_name || d?.brand
        const size = it?.size || it?.selected_size || d?.size
        const colour = it?.colour || it?.color || d?.colour || d?.color
        const gender = it?.gender || d?.gender
        const image_url =
          it?.image_url || d?.image_url || (Array.isArray(d?.images) ? d.images[0]?.url : undefined)
        const unitPrice =
          it?.price ??
          it?.final_price_b2c ??
          it?.sale_price ??
          d?.final_price_b2c ??
          d?.sale_price ??
          d?.price ??
          d?.mrp
        return {
          ...it,
          product_name: name,
          brand_name: brand,
          size,
          colour,
          gender,
          image_url,
          unitPrice
        }
      })
    )
    return enriched
  }

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

      const sJson = await sRes.json().catch(() => null)
      const sh = await shRes.json().catch(() => [])
      const el = await elRes.json().catch(() => null)
      const rr = await rrRes.json().catch(() => ({ rows: [] }))

      if (sJson && sJson.sale) {
        setSale(sJson.sale)
        const enriched = await enrichItems(Array.isArray(sJson.items) ? sJson.items : [])
        setSaleItems(enriched)
      } else if (sJson) {
        setSale(sJson)
        const enriched = await enrichItems(Array.isArray(sJson.items) ? sJson.items : [])
        setSaleItems(enriched)
      } else {
        setSale(null)
        setSaleItems([])
      }

      setShipments(Array.isArray(sh) ? sh : [])
      setEligibility(el)
      setRequests(Array.isArray(rr?.rows) ? rr.rows : [])

      const email = (sJson?.sale?.customer_email || sJson?.customer_email || '').trim()
      if (email) {
        const u = await fetch(`${API_BASE}/api/users/by-email/${encodeURIComponent(email)}`)
          .then((r) => r.json())
          .catch(() => null)
        if (u && !u.message) setCustomer(u)
      }
      setRefreshedAt(new Date().toLocaleString('en-IN'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [orderId])

  const money = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(n || 0))

  const prettyStatus = (s) => {
    if (isCancelledStatus(s)) return 'Cancelled'
    const v = String(s || '').toLowerCase()
    if (v.includes('deliver')) return 'Delivered'
    if (v.includes('out for')) return 'Out For Delivery'
    if (v.includes('ship')) return 'Shipped'
    if (v.includes('confirm')) return 'Confirmed'
    if (v.includes('rto')) return 'RTO'
    return 'Order Placed'
  }

  const isCancelled = isCancelledStatus(sale?.status)

  const stepsNormal = ['Order Placed', 'Confirmed', 'Shipped', 'Out For Delivery', 'Delivered']
  const stepsCancelled = ['Order Placed', 'Cancelled']

  const statusStepIndex = () => {
    if (isCancelled) return 1
    const s = prettyStatus(sale?.status)
    const i = stepsNormal.indexOf(s)
    return i >= 0 ? i : 0
  }

  const createdAt = sale?.created_at ? new Date(sale.created_at).toLocaleString('en-IN') : '-'
  const totals = sale?.totals || {}
  const payable = sale?.totals?.payable ?? sale?.total ?? 0
  const addr = sale?.shipping_address || {}
  const addressText = [addr?.name, addr?.line1, addr?.line2, addr?.city, addr?.state, addr?.pincode]
    .filter(Boolean)
    .join(', ')

  const paymentMethod = toUpper(sale?.payment_method || '')
  const paymentStatus = toUpper(sale?.payment_status || '')
  const isOnlinePaid = paymentStatus === 'PAID' && paymentMethod !== 'COD'

  const stepLabels = isCancelled ? stepsCancelled : stepsNormal

  return (
    <div className="order-details-page">
      <Navbar />
      <div className="order-details-wrap">
        <div className="od-header-bar">
          <div className="hdr-left">
            <button className="btn outline small" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>

          <div className="hdr-mid">
            <div className="title-row1">
              <h1>Order #{orderId}</h1>
              <span className={`pill ${isCancelled ? 'pill-red' : ''}`}>{prettyStatus(sale?.status)}</span>
            </div>

            <div className="sub-row">
              <span>Placed on {createdAt}</span>
              <span className="sep">•</span>
              <span>Payment {toUpper(sale?.payment_status || 'COD')}</span>
              <span className="sep">•</span>
              <span>{isOnlinePaid ? `Total Paid ${money(payable)}` : `Total Payable ${money(payable)}`}</span>
            </div>

            {isCancelled && (
              <div className="cancel-banner">
                <div className="cancel-title">Order is cancelled</div>
                <div className="cancel-sub">
                  If you already paid online, the refund will be processed as per our policy.
                </div>
              </div>
            )}
          </div>

          <div className="hdr-right">
            <button className="btn outline" onClick={fetchAll}>
              Refresh
            </button>
            <button className="btn outline" onClick={() => navigate(`/order/${orderId}/tracking`)}>
              Track Order
            </button>
          </div>
        </div>

        {loading ? (
          <div className="od-loader">
            <div className="od-spin" />
            <span>Loading</span>
          </div>
        ) : !sale ? (
          <div className="od-empty">Order not found</div>
        ) : (
          <>
            <div className={`progress-card ${isCancelled ? 'progress-cancelled' : ''}`}>
              <div className={`steps ${isCancelled ? 'steps-2' : ''}`}>
                {stepLabels.map((label, i) => {
                  const active = i <= statusStepIndex()
                  return (
                    <div className={`step ${active ? 'active' : ''} ${isCancelled && label === 'Cancelled' ? 'cancel' : ''}`} key={label}>
                      <div className="dot" />
                      <div className="slabel">{label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="od-grid">
              <div className="od-main">
                <div className="od-card">
                  <div className="od-section-title">Items</div>
                  <div className="od-items">
                    {Array.isArray(saleItems) && saleItems.length ? (
                      saleItems.map((it, idx) => {
                        const name = it.product_name || 'Product'
                        const brand = it.brand_name || it.brand || '-'
                        const size = it.size || it.selected_size || '-'
                        const color = it.colour || it.color || '-'
                        const gender = it.gender || '-'
                        const qty = Number(it.qty || 1)
                        const unitPrice = Number(it.unitPrice ?? it.price ?? 0)
                        const lineTotal = unitPrice * qty
                        return (
                          <div className="od-item v2" key={`${it.variant_id || it.product_id || idx}-${idx}`}>
                            <div className="thumb fixed">
                              {it.image_url ? <img src={it.image_url} alt={name} /> : <div className="ph" />}
                            </div>
                            <div className="detail">
                              <div className="title-block">
                                <div className="pname">{name}</div>
                                <div className="brand">{brand}</div>
                              </div>
                              <div className="details-list">
                                <div className="row">
                                  <span>Product name</span>
                                  <strong>{name}</strong>
                                </div>
                                <div className="row">
                                  <span>Brand name</span>
                                  <strong>{brand}</strong>
                                </div>
                                <div className="row">
                                  <span>Size</span>
                                  <strong>{size}</strong>
                                </div>
                                <div className="row">
                                  <span>Color</span>
                                  <strong>{color}</strong>
                                </div>
                                <div className="row">
                                  <span>Gender</span>
                                  <strong>{gender}</strong>
                                </div>
                                <div className="row">
                                  <span>Quantity</span>
                                  <strong>×{qty}</strong>
                                </div>
                              </div>
                              <div className="price-row">
                                <span>Total price</span>
                                <strong className="total">{money(lineTotal)}</strong>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="od-empty subtle">No items</div>
                    )}
                  </div>
                </div>

                <div className="od-two">
                  <div className="od-card">
                    <div className="od-section-title">Price Summary</div>
                    <div className="summary-grid">
                      <div className="kv">
                        <span>Bag Total</span>
                        <strong>{money(totals.bagTotal ?? 0)}</strong>
                      </div>
                      <div className="kv">
                        <span>Discount</span>
                        <strong>-{money(totals.discountTotal ?? 0)}</strong>
                      </div>
                      <div className="kv">
                        <span>Coupon</span>
                        <strong>-{money(totals.couponDiscount ?? 0)}</strong>
                      </div>
                      <div className="kv">
                        <span>Convenience</span>
                        <strong>{money(totals.convenience ?? 0)}</strong>
                      </div>
                      <div className="kv">
                        <span>Gift Wrap</span>
                        <strong>{money(totals.giftWrap ?? 0)}</strong>
                      </div>
                      <div className="kv total">
                        <span>{isOnlinePaid ? 'Paid Amount' : 'Payable'}</span>
                        <strong className="gold">{money(payable)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="od-card">
                    <div className="od-section-title">Shipments</div>
                    <div className="od-shipments">
                      {shipments.length === 0 ? (
                        <div className="od-empty subtle">No shipments yet</div>
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
                                <strong className="gold">{toUpper(sh.status || 'CREATED')}</strong>
                              </div>
                            </div>
                            <div className="ship-actions">
                              {sh.tracking_url ? (
                                <a className="btn outline" href={sh.tracking_url} target="_blank" rel="noreferrer">
                                  Track
                                </a>
                              ) : null}
                              {sh.label_url ? (
                                <a className="btn outline" href={sh.label_url} target="_blank" rel="noreferrer">
                                  Label
                                </a>
                              ) : null}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="od-side">
                <div className="od-card">
                  <div className="od-section-title">Customer</div>
                  <div className="kv">
                    <span>Name</span>
                    <strong>{sale?.customer_name || customer?.name || 'Customer'}</strong>
                  </div>
                  <div className="kv">
                    <span>Email</span>
                    <strong className="wrap">{sale?.customer_email || customer?.email || '-'}</strong>
                  </div>
                  <div className="kv">
                    <span>Mobile</span>
                    <strong>{sale?.customer_mobile || customer?.mobile || '-'}</strong>
                  </div>
                  <div className="kv">
                    <span>Account Type</span>
                    <strong>{customer?.type || 'Customer'}</strong>
                  </div>
                  <div className="kv">
                    <span>Joined</span>
                    <strong>{customer?.created_at ? new Date(customer.created_at).toLocaleDateString('en-IN') : '-'}</strong>
                  </div>
                </div>

                <div className="od-card">
                  <div className="od-section-title">Shipping Address</div>
                  <div className="kv">
                    <span>Name</span>
                    <strong>{addr?.name || sale?.customer_name || '—'}</strong>
                  </div>
                  <div className="kv">
                    <span>Address</span>
                    <strong className="wrap">{addressText || '—'}</strong>
                  </div>
                </div>

                <div className="od-card">
                  <div className="od-section-title">Returns & Replacements</div>
                  {isCancelled ? (
                    <div className="od-note">Returns and replacements are not available for cancelled orders.</div>
                  ) : eligibility?.ok ? (
                    <div className="od-ret-actions">
                      <a className="btn outline wide" href={`/returns?saleId=${encodeURIComponent(orderId)}&type=RETURN`}>
                        Request Return
                      </a>
                      <a className="btn outline wide" href={`/returns?saleId=${encodeURIComponent(orderId)}&type=REPLACE`}>
                        Request Replacement
                      </a>
                    </div>
                  ) : (
                    <div className="od-note">
                      {eligibility?.reason ? `Not eligible: ${eligibility.reason}` : 'Eligibility not available'}
                    </div>
                  )}

                  {Array.isArray(requests) && requests.length ? (
                    <div className="od-rr-list">
                      {requests.map((r) => (
                        <div className="od-rr-row" key={r.id}>
                          <div className="rr-kv">
                            <span>Type</span>
                            <strong>{r.type}</strong>
                          </div>
                          <div className="rr-kv">
                            <span>Status</span>
                            <strong>{toUpper(r.status || '')}</strong>
                          </div>
                          <div className="rr-kv">
                            <span>Reason</span>
                            <strong>{r.reason || '-'}</strong>
                          </div>
                          <div className="rr-kv">
                            <span>Created</span>
                            <strong>{r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : '-'}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="footer-note">
              <span>Last refreshed: {refreshedAt || '-'}</span>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
