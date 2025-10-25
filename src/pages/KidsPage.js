import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './KidsPage.css'
import Footer from './Footer'
import FilterSidebar from './FilterSidebar'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useWishlist } from '../WishlistContext'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

const DEFAULT_IMG = '/images/kids/kids-girls-frock.jpg'
const toArray = (x) => (Array.isArray(x) ? x : [])

export default function KidsPage() {
  const [allProducts, setAllProducts] = useState([])
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState({})
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [likedKeys, setLikedKeys] = useState(new Set())
  const navigate = useNavigate()
  const { addToWishlist, wishlistItems, setWishlistItems } = useWishlist()
  const userId = sessionStorage.getItem('userId')

  const keyFor = (p) => String(p.ean_code ?? p.product_id ?? p.id ?? `${p.image_url}`)

  useEffect(() => {
    setUserType(sessionStorage.getItem('userType'))
  }, [])

  useEffect(() => {
    setLikedKeys(
      new Set(
        toArray(wishlistItems).map(
          (it) => String(it.ean_code ?? it.product_id ?? it.id ?? `${it.image_url}`)
        )
      )
    )
  }, [wishlistItems])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/products?gender=KIDS`)
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        const arr = toArray(data).map((p, i) => ({
          id: p.id ?? p.product_id ?? i + 1,
          product_id: p.product_id ?? p.id ?? i + 1,
          brand: p.brand ?? p.brand_name ?? '',
          product_name: p.product_name ?? p.name ?? '',
          image_url: p.image_url || DEFAULT_IMG,
          ean_code: p.ean_code ?? p.EANCode ?? p.ean ?? '',
          original_price_b2c: p.original_price_b2c ?? p.mrp ?? p.list_price ?? 0,
          final_price_b2c: p.final_price_b2c ?? p.sale_price ?? p.price ?? p.mrp ?? 0,
          original_price_b2b: p.original_price_b2b ?? p.mrp ?? 0,
          final_price_b2b: p.final_price_b2b ?? p.sale_price ?? 0
        }))
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
    const k = keyFor(product)
    const already = likedKeys.has(k)
    try {
      if (already) {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: product.product_id ?? product.id })
        })
        setWishlistItems((prev) =>
          prev.filter(
            (item) => String(item.ean_code ?? item.product_id ?? item.id ?? `${item.image_url}`) !== k
          )
        )
        setLikedKeys((prev) => {
          const n = new Set(prev)
          n.delete(k)
          return n
        })
      } else {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: product.product_id ?? product.id })
        })
        addToWishlist({ ...product, product_id: product.product_id ?? product.id })
        setLikedKeys((prev) => {
          const n = new Set(prev)
          n.add(k)
          return n
        })
      }
    } catch {}
  }

  const handleProductClick = (product) => {
    sessionStorage.setItem('selectedProduct', JSON.stringify(product))
    navigate('/checkout')
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
    <div className="kids-page">
      <Navbar />
      <div className="kids-test">
        <FilterSidebar onFilterChange={(f) => setFilters(f)} />
        <div className="kids-page-main">
          <div className="kids-page-content">
            <section className="kids-section1">
              <div className="kids-section1-bg">
                <img src="/images/kids-bg.jpg" alt="Kids Fashion Background" />
                <div className="kids-section1-overlay">
                  <div className="kids-section1-text">
                    <h1>Kids</h1>
                    <h1>Fashion</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="kids-section4">
              {loading ? (
                <div className="kids-notice">Loading products…</div>
              ) : error ? (
                <div className="kids-notice">{error}</div>
              ) : !products.length ? (
                <div className="kids-notice">No products found</div>
              ) : (
                <div className="kids-section4-grid">
                  {toArray(products).map((product, idx) => {
                    const liked = likedKeys.has(keyFor(product))
                    return (
                      <div
                        key={product.id || idx}
                        className="kids-section4-card"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="kids-section4-img">
                          <img
                            src={product.image_url || DEFAULT_IMG}
                            alt={product.product_name}
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_IMG
                            }}
                          />
                          <div
                            className="love-icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleLike(product)
                            }}
                          >
                            {liked ? (
                              <FaHeart style={{ color: 'yellow', fontSize: 18 }} />
                            ) : (
                              <FaRegHeart style={{ color: 'yellow', fontSize: 24 }} />
                            )}
                          </div>
                        </div>
                        <h4 className="brand-name">{product.brand}</h4>
                        <h5 className="product-name">{product.product_name}</h5>
                        <div className="kids-section4-price">
                          <span className="offer-price">₹{Number(priceForUser(product) || 0).toFixed(2)}</span>
                          <span className="original-price">₹{Number(mrpForUser(product) || 0).toFixed(2)}</span>
                          <span className="discount">({discountPct(product)}% OFF)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="kids-section2">
              <div className="kids-section2-bg">
                <img src="/images/mens-bg1.jpg" alt="Kids Style Background" />
                <div className="kids-section2-overlay">
                  <div className="kids-section2-text">
                    <h1>Style Up</h1>
                    <h1>Your</h1>
                    <h1>Wardrobe</h1>
                  </div>
                </div>
              </div>
            </section>

            <section className="kids-section3">
              <div className="kids-section3-left">
                <img src="/images/mens-part1.jpg" alt="Left Fashion" />
              </div>
              <div className="kids-section3-center">
                <h2>Exclusive offers</h2>
                <div className="kids-section3-discount">
                  <span className="line"></span>
                  <h1>50% OFF</h1>
                  <span className="line"></span>
                </div>
                <h3>Just for you</h3>
              </div>
              <div className="kids-section3-right">
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
