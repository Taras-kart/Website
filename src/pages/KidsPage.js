import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import './KidsPage.css'
import Footer from './Footer'
import FilterSidebar from './FilterSidebar'
import { useWishlist } from '../WishlistContext'
import KidsDisplayPage from './KidsDisplayPage'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

const DEFAULT_IMG = '/images/kids/kids-girls-frock.jpg'
const toArray = (x) => (Array.isArray(x) ? x : [])

const normBool = (v) => {
  if (v === true || v === false) return v
  if (v === 1 || v === 0) return Boolean(v)
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    if (s === 'true' || s === '1' || s === 'yes') return true
    if (s === 'false' || s === '0' || s === 'no') return false
  }
  return undefined
}

const numOrZero = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const computeOutOfStock = (p) => {
  const explicit = normBool(p.is_out_of_stock)
  if (explicit !== undefined) return explicit

  const inStock = normBool(p.in_stock)
  if (inStock !== undefined) return !inStock

  const available = numOrZero(
    p.available_qty !== undefined ? p.available_qty : p.availableQty !== undefined ? p.availableQty : undefined
  )
  if (available > 0) return false
  if (p.available_qty !== undefined || p.availableQty !== undefined) return true

  const onHand = numOrZero(p.on_hand !== undefined ? p.on_hand : p.onHand !== undefined ? p.onHand : undefined)
  const reserved = numOrZero(p.reserved !== undefined ? p.reserved : p.reservedQty !== undefined ? p.reservedQty : 0)
  if (p.on_hand !== undefined || p.onHand !== undefined) return onHand - reserved <= 0

  return false
}

const clampScrollY = (y) => {
  const max = Math.max(0, (document.documentElement?.scrollHeight || 0) - (window.innerHeight || 0))
  return Math.min(Math.max(0, y), max)
}

export default function KidsPage() {
  const [allProducts, setAllProducts] = useState([])
  const [products, setProducts] = useState([])
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [likedKeys, setLikedKeys] = useState(new Set())
  const navigate = useNavigate()
  const { addToWishlist, wishlistItems, setWishlistItems } = useWishlist()

  const restoreDoneRef = useRef(false)
  const rafSaveRef = useRef(0)

  const getUserId = () => {
    if (typeof window === 'undefined') return null
    const id = sessionStorage.getItem('userId') || localStorage.getItem('userId')
    if (!id) return null
    const n = Number(id)
    if (!Number.isInteger(n)) return null
    return String(n)
  }

  const userId = getUserId()

  useEffect(() => {
    const t = sessionStorage.getItem('userType') || localStorage.getItem('userType')
    setUserType(t)
  }, [])

  const keyFor = (p) => {
    const pid = p?.product_id ?? p?.id ?? ''
    const ean = p?.ean_code ?? ''
    return `${String(pid)}::${String(ean)}`
  }

  useEffect(() => {
    setLikedKeys(new Set(toArray(wishlistItems).map((it) => keyFor(it))))
  }, [wishlistItems])

  useEffect(() => {
    const onScroll = () => {
      if (rafSaveRef.current) return
      rafSaveRef.current = requestAnimationFrame(() => {
        rafSaveRef.current = 0
        const y = window.scrollY || window.pageYOffset || 0
        sessionStorage.setItem('scroll:kids-page', String(y))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafSaveRef.current) cancelAnimationFrame(rafSaveRef.current)
      rafSaveRef.current = 0
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/products?gender=KIDS&limit=50000&_t=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        const arr = toArray(data).map((p, i) => ({
          id: p.id ?? p.product_id ?? i + 1,
          product_id: p.product_id ?? p.id ?? i + 1,
          brand: p.brand ?? p.brand_name ?? '',
          product_name: p.product_name ?? p.name ?? '',
          image_url: p.image_url || DEFAULT_IMG,
          ean_code: p.ean_code ?? p.EANCode ?? p.ean ?? '',
          gender: p.gender ?? 'KIDS',
          color: p.color ?? '',
          size: p.size ?? '',
          original_price_b2c: p.original_price_b2c ?? p.mrp ?? p.list_price ?? 0,
          final_price_b2c: p.final_price_b2c ?? p.sale_price ?? p.price ?? p.mrp ?? 0,
          original_price_b2b: p.original_price_b2b ?? p.mrp ?? 0,
          final_price_b2b: p.final_price_b2b ?? p.sale_price ?? 0,
          on_hand: p.on_hand ?? p.onHand,
          reserved: p.reserved ?? p.reservedQty,
          available_qty: p.available_qty ?? p.availableQty,
          in_stock: p.in_stock ?? p.inStock,
          is_out_of_stock: computeOutOfStock(p)
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

  useLayoutEffect(() => {
    if (restoreDoneRef.current) return
    if (loading) return
    restoreDoneRef.current = true
    const saved = sessionStorage.getItem('scroll:kids-page')
    const yRaw = saved != null ? parseInt(saved, 10) : 0
    const y = Number.isFinite(yRaw) ? yRaw : 0
    requestAnimationFrame(() => {
      window.scrollTo(0, clampScrollY(y))
      requestAnimationFrame(() => window.scrollTo(0, clampScrollY(y)))
    })
  }, [loading, products.length, error])

  useEffect(() => {
    const loadWishlist = async () => {
      if (!userId) return
      try {
        const r = await fetch(`${API_BASE}/api/wishlist/${userId}`)
        const data = await r.json()
        setWishlistItems(Array.isArray(data) ? data : [])
      } catch {}
    }
    loadWishlist()
  }, [userId, setWishlistItems])

  const toggleLike = async (group, picked) => {
    if (!userId) return
    const pid = group.product_id || group.id
    const ean_code = String(picked?.ean_code || group?.ean_code || '')
    const image_url = String(picked?.image_url || group?.image_url || '')
    const color = String(picked?.color || group?.color || '')

    if (!ean_code) return

    const k = keyFor({ product_id: pid, ean_code })
    const inList = likedKeys.has(k)

    try {
      if (inList) {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: pid, ean_code })
        })

        setWishlistItems((prev) => prev.filter((it) => keyFor(it) !== k))
        setLikedKeys((prev) => {
          const n = new Set(prev)
          n.delete(k)
          return n
        })
      } else {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: pid, ean_code, image_url, color })
        })

        const payload = {
          ...(picked || group),
          product_id: pid,
          ean_code,
          image_url,
          color: color || (picked || group)?.color || ''
        }

        addToWishlist(payload)

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
      <div className="filter-bar-class">
        <FilterSidebar source={allProducts} onFilterChange={(list) => setProducts(Array.isArray(list) ? list : allProducts)} />
        <div className="kids-page-main">
          <div className="kids-page-content">
            <section className="kids-section1">
              <div className="kids-section1-bg">
                <img src="/images/coming-soon.jpg" alt="Kids Fashion Background" />
                {/*<div className="kids-section1-overlay">
                  <div className="kids-section1-text">
                    <h1>Kids</h1>
                    <h1>Fashion</h1>
                  </div>
                </div> */}
              </div>
            </section>

            <KidsDisplayPage
              products={products}
              userType={userType}
              loading={loading}
              error={error}
              likedKeys={likedKeys}
              keyFor={keyFor}
              onToggleLike={toggleLike}
              onProductClick={handleProductClick}
              priceForUser={priceForUser}
              mrpForUser={mrpForUser}
              discountPct={discountPct}
            />

            {/*<section className="kids-section2">
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
            </section> */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
