// MenPage.js
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './MenPage.css'
import Footer from './Footer'
import FilterSidebar from './FilterSidebar'
import { useWishlist } from '../WishlistContext'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')
const CLOUD_NAME = 'deymt9uyh'
const DEFAULT_IMG = '/images/men/mens13.jpeg'
const toArray = (x) => (Array.isArray(x) ? x : [])

function cloudinaryUrlByEan(ean) {
  if (!ean) return ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/products/${ean}`
}

export default function MenPage() {
  const navigate = useNavigate()
  const { addToWishlist, wishlistItems } = useWishlist()
  const [allProducts, setAllProducts] = useState([])
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState({})
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userId = sessionStorage.getItem('userId')

  useEffect(() => {
    setUserType(sessionStorage.getItem('userType'))
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/products?gender=MEN&_t=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        const isPlaceholder = (url) => {
          if (!url) return true
          return /^\/images\//.test(url)
        }
        const arr = toArray(data).map((p, i) => {
          const ean =
            p.ean_code ??
            p.EANCode ??
            p.ean ??
            p.barcode ??
            p.bar_code ??
            ''
          const apiImage = !isPlaceholder(p.image_url) ? p.image_url : ''
          const candidateCloudinary = ean ? cloudinaryUrlByEan(ean) : ''
          const img = apiImage || candidateCloudinary || DEFAULT_IMG
          return {
            id: p.id ?? p.product_id ?? i + 1,
            brand: p.brand ?? p.brand_name ?? '',
            product_name: p.product_name ?? p.name ?? '',
            image_url: img,
            ean_code: ean,
            original_price_b2c: p.original_price_b2c ?? p.mrp ?? p.list_price ?? 0,
            final_price_b2c: p.final_price_b2c ?? p.sale_price ?? p.price ?? p.mrp ?? 0,
            original_price_b2b: p.original_price_b2b ?? p.mrp ?? 0,
            final_price_b2b: p.final_price_b2b ?? p.sale_price ?? 0
          }
        })
        if (!cancelled) {
          setAllProducts(arr)
          setProducts(arr)
        }
      } catch {
        if (!cancelled) {
          setAllProducts([])
          setProducts([])
          setError('Unable to load products')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    let list = [...allProducts]
    if (filters.brand) list = list.filter((p) => p.brand === filters.brand)
    if (filters.priceRange) {
      list = list.filter(
        (p) =>
          (p.final_price_b2c ?? 0) >= filters.priceRange.min &&
          (p.final_price_b2c ?? 0) <= filters.priceRange.max
      )
    }
    return list
  }, [allProducts, filters])

  useEffect(() => {
    setProducts(filtered)
  }, [filtered])

  const toggleLike = async (product) => {
    const alreadyInWishlist = wishlistItems.some((item) => item.product_name === product.product_name)
    try {
      if (alreadyInWishlist) {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: product.id })
        })
      } else {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: product.id })
        })
        addToWishlist(product)
      }
    } catch {}
  }

  const handleProductClick = (product) => {
    sessionStorage.setItem('selectedProduct', JSON.stringify(product))
    const newTab = window.open('/checkout', '_blank')
    if (newTab) {
      newTab.onload = () => {
        try {
          newTab.sessionStorage.setItem('selectedProduct', JSON.stringify(product))
        } catch {}
      }
    }
  }

  const priceForUser = (p) => (userType === 'B2B' ? p.final_price_b2b || p.final_price_b2c : p.final_price_b2c)
  const mrpForUser = (p) => (userType === 'B2B' ? p.original_price_b2b || p.original_price_b2c : p.original_price_b2c)
  const discountPct = (p) => {
    const mrp = Number(mrpForUser(p) || 0)
    const price = Number(priceForUser(p) || 0)
    if (!mrp || mrp <= 0) return 0
    const pct = ((mrp - price) / mrp) * 100
    return Math.max(0, Math.round(pct))
  }

  return (
    <div className="men-page">
      <Navbar />
      <div className="test">
        <FilterSidebar onFilterChange={(f) => setFilters(f)} />
        <div className="men-page-main">
          <div className="men-page-content">
            <section className="mens-section1">
              <div className="mens-section1-bg">
                <img src="/images/up1.jpg" alt="Mens Fashion Background" />
                <div className="mens-section1-overlay">
                  <div className="mens-section1-text">
                    <h1>Mens</h1>
                    <h1>Fashion</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="mens-section4">
              {loading ? (
                <div className="mens-notice">Loading products…</div>
              ) : error ? (
                <div className="mens-notice">{error}</div>
              ) : !products.length ? (
                <div className="mens-notice">No products found</div>
              ) : (
                <div className="mens-section4-grid">
                  {toArray(products).map((product, idx) => (
                    <div
                      key={product.id || idx}
                      className="mens-section4-card"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="mens-section4-img">
                        <img
                          src={product.image_url || DEFAULT_IMG}
                          alt={product.product_name}
                          onError={(e) => {
                            if (e.currentTarget.dataset.fallbackApplied) {
                              e.currentTarget.src = DEFAULT_IMG
                              return
                            }
                            e.currentTarget.dataset.fallbackApplied = '1'
                            e.currentTarget.src = product.ean_code
                              ? cloudinaryUrlByEan(product.ean_code)
                              : DEFAULT_IMG
                          }}
                        />
                        <div
                          className="love-icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLike(product)
                          }}
                        >
                          {wishlistItems.find((item) => item.product_name === product.product_name) ? (
                            <FaHeart style={{ color: 'yellow', fontSize: 20 }} />
                          ) : (
                            <FaRegHeart style={{ color: 'yellow', fontSize: 20 }} />
                          )}
                        </div>
                      </div>
                      <h4 className="brand-name">{product.brand}</h4>
                      <h5 className="product-name">{product.product_name}</h5>
                      <div className="mens-section4-price">
                        <span className="offer-price">₹{Number(priceForUser(product) || 0).toFixed(2)}</span>
                        <span className="original-price">₹{Number(mrpForUser(product) || 0).toFixed(2)}</span>
                        <span className="discount">({discountPct(product)}% OFF)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mens-section2">
              <div className="mens-section2-bg">
                <img src="/images/mens-bg1.jpg" alt="Mens Style Background" />
                <div className="mens-section2-overlay">
                  <div className="mens-section2-text">
                    <h1>Style Up</h1>
                    <h1>Your</h1>
                    <h1>Wardrobe</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="mens-section3">
              <div className="mens-section3-left">
                <img src="/images/mens-part1.jpg" alt="Left Fashion" />
              </div>
              <div className="mens-section3-center">
                <h2>Exclusive offers</h2>
                <div className="mens-section3-discount">
                  <span className="line"></span>
                  <h1>50% OFF</h1>
                  <span className="line"></span>
                </div>
                <h3>Just for you</h3>
              </div>
              <div className="mens-section3-right">
                <img src="/images/mens-part2.jpg" alt="Right Fashion" />
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
