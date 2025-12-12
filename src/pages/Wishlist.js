import React, { useState, useEffect } from 'react'
import './Wishlist.css'
import { useNavigate } from 'react-router-dom'
import WishlistPopup from './WishlistPopup'
import Navbar from './Navbar'
import Footer from './Footer'
import { useWishlist } from '../WishlistContext'
import { FaTimes } from 'react-icons/fa'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

const BRANCH_ID_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BRANCH_ID) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BRANCH_ID) ||
  ''
const BRANCH_ID = BRANCH_ID_RAW ? String(BRANCH_ID_RAW).trim() : ''

const Wishlist = () => {
  const { wishlistItems, setWishlistItems } = useWishlist()
  const [showPopup, setShowPopup] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userType, setUserType] = useState(() => {
    if (typeof window === 'undefined') return 'B2C'
    return sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C'
  })
  const navigate = useNavigate()
  const userId =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('userId') || localStorage.getItem('userId')
      : null

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const syncUserType = () => {
      if (typeof window === 'undefined') return
      const storedType = sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C'
      if (storedType !== userType) setUserType(storedType)
    }
    window.addEventListener('storage', syncUserType)
    const interval = setInterval(syncUserType, 500)
    return () => {
      window.removeEventListener('storage', syncUserType)
      clearInterval(interval)
    }
  }, [userType])

  useEffect(() => {
    const run = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }
      try {
        let url = `${API_BASE}/api/wishlist/${userId}`
        if (BRANCH_ID) {
          const sep = url.includes('?') ? '&' : '?'
          url += `${sep}branch_id=${encodeURIComponent(BRANCH_ID)}`
        }
        const res = await fetch(url)
        const data = await res.json()
        setWishlistItems(Array.isArray(data) ? data : [])
      } catch {
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [userId, setWishlistItems])

  const handleRemove = (item) => {
    setSelectedItem(item)
    setShowPopup(true)
  }

  const confirmRemove = async () => {
    try {
      const payload = { user_id: userId, product_id: selectedItem.product_id }
      if (BRANCH_ID) payload.branch_id = BRANCH_ID
      await fetch(`${API_BASE}/api/wishlist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const updatedWishlist = wishlistItems.filter(
        (item) => String(item.product_id) !== String(selectedItem.product_id)
      )
      setWishlistItems(updatedWishlist)
    } catch {
    } finally {
      setShowPopup(false)
    }
  }

  const fmt = (n) => Number(n || 0).toFixed(2)

  const getItemPricing = (item) => {
    if (userType === 'B2B') {
      const mrp = Number(
        item.original_price_b2b ??
          item.mrp ??
          item.original_price_b2c ??
          item.final_price_b2b ??
          item.final_price_b2c ??
          0
      )
      const offer = Number(item.final_price_b2b ?? item.final_price_b2c ?? item.sale_price ?? mrp)
      return { mrp, offer }
    }
    const mrp = Number(
      item.original_price_b2c ??
        item.mrp ??
        item.original_price_b2b ??
        item.final_price_b2c ??
        item.final_price_b2b ??
        0
    )
    const offer = Number(item.final_price_b2c ?? item.sale_price ?? mrp)
    return { mrp, offer }
  }

  return (
    <div className="wishlist galaxy-bg">
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="glow-orb"></div>

      <Navbar />

      <div className="wishlist-page">
        <header className="wishlist-hero">
          <div className="hero-content">
            <div className="hero-top">
              <div className="hero-kicker">Wishlist</div>
              <div className="hero-line"></div>
            </div>
            <h1>Saved Items</h1>
            <p>Everything you liked, kept in one place for a quicker checkout.</p>
          </div>
        </header>

        {isLoading ? (
          <div className="loader-wrap">
            <div className="loader"></div>
            <p>Loading your wishlist…</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="empty-wishlist glass">
            <img src="/images/emptyWishlist.avif" alt="Empty Wishlist" />
            <h2>No saved items yet</h2>
            <p>Tap the heart on any product to save it here.</p>
            <button className="btn primary" onClick={() => navigate('/')}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="wishlist-content">
            <div className="wishlist-toolbar">
              <div className="toolbar-left">
                <span className="wishlist-count">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                </span>
                <span className="mode-pill">
                  {userType === 'B2B' ? 'Business pricing' : 'Retail pricing'}
          </span>
              </div>

              <div className="toolbar-actions">
                <button className="chip" onClick={() => navigate('/women')}>Women</button>
                <button className="chip" onClick={() => navigate('/men')}>Men</button>
                <button className="chip" onClick={() => navigate('/kids')}>Kids</button>
                <button className="chip strong" onClick={() => navigate('/cart')}>Cart</button>
              </div>
            </div>

            <div className="wishlist-grid">
              {wishlistItems.map((item, index) => {
                const { mrp, offer } = getItemPricing(item)
                const discountPct = mrp > 0 && offer < mrp ? Math.round(((mrp - offer) / mrp) * 100) : 0

                return (
                  <div key={item.product_id ?? index} className="wishlist-card">
                    <div
                      className="wishlist-image-container"
                      onClick={() => {
                        sessionStorage.setItem('selectedProduct', JSON.stringify(item))
                        navigate('/checkout')
                      }}
                    >
                      <img src={item.image_url} alt={item.product_name} loading="lazy" decoding="async" />
                      <button
                        type="button"
                        className="remove-icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(item)
                        }}
                        aria-label="Remove"
                      >
                        <FaTimes />
                      </button>
                      {discountPct > 0 && <span className="discount-pill">{discountPct}% off</span>}
                    </div>

                    <div className="card-body">
                      <div className="brand-row">
                        <h4 className="wishlist-brand">{item.brand || 'Brand'}</h4>
                        <span className="pill">{item.gender || 'UNISEX'}</span>
                      </div>

                      <p className="wishlist-name" title={item.product_name}>
                        {item.product_name}
                      </p>

                      <div className="wishlist-price">
                        <span className="wishlist-offer">₹{fmt(offer)}</span>
                        <span className="wishlist-original">₹{fmt(mrp)}</span>
                      </div>

                      <div className="card-actions">
                        <button
                          className="btn ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            sessionStorage.setItem('selectedProduct', JSON.stringify(item))
                            navigate('/checkout')
                          }}
                        >
                          Move to Bag
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {showPopup && (
          <WishlistPopup onConfirm={confirmRemove} onCancel={() => setShowPopup(false)} />
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Wishlist
