import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import './TrackOrder.css'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

export default function TrackOrder() {
  const [sp] = useSearchParams()
  const initialOrderId = useMemo(() => sp.get('orderId') || '', [sp])
  const [orderId, setOrderId] = useState(initialOrderId)
  const [channelId, setChannelId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tracking, setTracking] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!orderId.trim()) return
    setLoading(true)
    setError('')
    setTracking(null)
    try {
      const path = channelId.trim()
        ? `/api/shiprocket/track/${encodeURIComponent(orderId.trim())}/${encodeURIComponent(channelId.trim())}`
        : `/api/shiprocket/track/${encodeURIComponent(orderId.trim())}`
      const res = await fetch(`${API_BASE}${path}`)
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || 'Failed to fetch tracking')
      }
      const data = await res.json()
      setTracking(data)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const mainStatus = () => {
    if (!tracking) return ''
    const td = tracking.tracking_data || {}
    return (
      td.shipment_status ||
      td.current_status ||
      tracking.current_status ||
      tracking.status ||
      ''
    )
  }

  const trackUrl = () => {
    if (!tracking) return ''
    const td = tracking.tracking_data || {}
    return td.track_url || tracking.track_url || ''
  }

  return (
    <div className="trackorder-page">
      <Navbar />
      <div className="trackorder-wrap">
        <div className="trackorder-head">
          <h1>Track Your Order</h1>
          <p>Enter your Shiprocket order id to see live tracking</p>
        </div>
        <form className="trackorder-form" onSubmit={handleSubmit}>
          <div className="to-row">
            <div className="to-field">
              <label htmlFor="orderId">Order ID</label>
              <input
                id="orderId"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="Enter Shiprocket order id"
              />
            </div>
            <div className="to-field">
              <label htmlFor="channelId">Channel ID (optional)</label>
              <input
                id="channelId"
                value={channelId}
                onChange={e => setChannelId(e.target.value)}
                placeholder="Enter channel id if needed"
              />
            </div>
            <div className="to-actions">
              <button type="submit" className="to-btn-primary" disabled={loading}>
                {loading ? 'Checking...' : 'Track'}
              </button>
            </div>
          </div>
          {error ? <div className="to-error">{error}</div> : null}
        </form>

        {tracking && (
          <div className="trackorder-result">
            <div className="to-summary">
              <div className="to-summary-row">
                <span>Status</span>
                <strong>{mainStatus() || 'N/A'}</strong>
              </div>
              {trackUrl() ? (
                <div className="to-summary-row">
                  <span>Shiprocket Link</span>
                  <a className="to-link" href={trackUrl()} target="_blank" rel="noreferrer">
                    Open Tracking
                  </a>
                </div>
              ) : null}
            </div>
            <div className="to-json">
              <h2>Raw Tracking Data</h2>
              <pre>{JSON.stringify(tracking, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
