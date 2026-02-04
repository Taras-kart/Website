import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import Navbar from './Navbar'
import './WomenPage.css'
import Footer from './Footer'
import WomenDisplayPage from './WomenDisplayPage'
import { useWishlist } from '../WishlistContext'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

const CLOUD_NAME = 'deymt9uyh'
const DEFAULT_IMG = '/images/women/women20.jpeg'
const toArray = (x) => (Array.isArray(x) ? x : [])
const niceTitle = (s) => String(s || '').trim()
const normalizeKey = (s) => String(s || '').trim().toLowerCase()

function cloudinaryUrlByEan(ean) {
  if (!ean) return ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/products/${ean}`
}

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

const readVariantMap = (userId) => {
  if (typeof window === 'undefined') return {}
  if (!userId) return {}
  try {
    const raw = localStorage.getItem(`wishlist:variant-map:${userId}`)
    const obj = raw ? JSON.parse(raw) : {}
    return obj && typeof obj === 'object' ? obj : {}
  } catch {
    return {}
  }
}

const writeVariantMap = (userId, map) => {
  if (typeof window === 'undefined') return
  if (!userId) return
  try {
    localStorage.setItem(`wishlist:variant-map:${userId}`, JSON.stringify(map || {}))
  } catch {}
}

const CATEGORY_GROUPS = [
  { title: 'Leggings', keywords: ['ankle legging', 'chudidar legging', 'cropped legging', 'legging'] },
  { title: 'Jeggings', keywords: ['coloured jegging', 'jegging'] },
  { title: 'Shimmer', keywords: ['chudidar shimmer', 'shimmer shawl', 'shimmer'] }
]

const matchGroupedCategory = (name) => {
  const n = normalizeKey(name).replace(/\s+/g, ' ').trim()
  if (!n) return ''
  for (const g of CATEGORY_GROUPS) {
    for (const k of g.keywords) {
      if (n.includes(k)) return g.title
    }
  }
  return ''
}

const deriveCategory = (p) => {
  const name = String(p?.product_name || '').trim()
  if (!name) return 'Others'

  const grouped = matchGroupedCategory(name)
  if (grouped) return grouped

  const cleaned = name
    .replace(/\s+/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/[()]/g, ' ')
    .trim()
  const parts = cleaned.split(' ').filter(Boolean)
  const top = parts.slice(0, 3).join(' ')
  return top || 'Others'
}

function EmptyState({ category }) {
  return (
    <div className="women-empty-wrap">
      <div className="women-empty-card">
        <div className="women-empty-top">
          <div className="women-empty-badge">No products found</div>
          <h3 className="women-empty-title">
            {category ? (
              <>
                No items found for <span className="women-empty-accent">{category}</span>
              </>
            ) : (
              <>We couldn’t find items right now</>
            )}
          </h3>
          <p className="women-empty-sub">Try another category, or browse everything.</p>
        </div>

        <div className="women-empty-actions">
          <Link to="/category-display" className="women-empty-btn primary">
            Browse Categories
          </Link>
          <Link to="/women" className="women-empty-btn">
            View All Products
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function WomenPage() {
  const [allProducts, setAllProducts] = useState([])
  const [products, setProducts] = useState([])
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [likedKeys, setLikedKeys] = useState(new Set())
  const navigate = useNavigate()
  const location = useLocation()
  const { addToWishlist, wishlistItems, setWishlistItems } = useWishlist()

  const restoreDoneRef = useRef(false)
  const rafSaveRef = useRef(0)

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const selectedCategory = niceTitle(params.get('category'))
  const selectedBrand = niceTitle(params.get('brand'))

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
        sessionStorage.setItem('scroll:women-page', String(y))
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
        const res = await fetch(`${API_BASE}/api/products?gender=WOMEN&limit=50000&_t=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()

        const arr = toArray(data).map((p, i) => {
          const ean = p.ean_code ?? p.EANCode ?? p.ean ?? p.barcode ?? p.bar_code ?? ''
          const img = p.image_url || (ean ? cloudinaryUrlByEan(ean) : '') || DEFAULT_IMG
          return {
            id: p.id ?? p.product_id ?? i + 1,
            product_id: p.product_id ?? p.id ?? i + 1,
            brand: p.brand ?? p.brand_name ?? '',
            product_name: p.product_name ?? p.name ?? '',
            image_url: img,
            ean_code: ean,
            gender: p.gender ?? 'WOMEN',
            color: p.color ?? p.colour ?? '',
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
          }
        })

        let filtered = arr
        if (selectedBrand) filtered = filtered.filter((x) => normalizeKey(x.brand) === normalizeKey(selectedBrand))

        if (!cancelled) setAllProducts(filtered)
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
  }, [selectedBrand])

  useEffect(() => {
    const base = allProducts || []
    const cat = niceTitle(selectedCategory)
    const next = cat ? base.filter((p) => normalizeKey(deriveCategory(p)) === normalizeKey(cat)) : base
    setProducts(next)
  }, [allProducts, selectedCategory])

  useLayoutEffect(() => {
    if (restoreDoneRef.current) return
    if (loading) return
    restoreDoneRef.current = true
    const saved = sessionStorage.getItem('scroll:women-page')
    const yRaw = saved != null ? parseInt(saved, 10) : 0
    const y = Number.isFinite(yRaw) ? yRaw : 0
    requestAnimationFrame(() => {
      window.scrollTo(0, clampScrollY(y))
      requestAnimationFrame(() => window.scrollTo(0, clampScrollY(y)))
    })
  }, [loading, products.length, error])

  const toggleLike = async (group, picked) => {
    if (!userId) return
    const pid = group.product_id || group.id
    const ean_code = String(picked?.ean_code || '')
    const image_url = String(picked?.image_url || '')
    const color = String(picked?.color || '')

    if (!ean_code || !image_url) return

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

        const map = readVariantMap(userId)
        delete map[k]
        writeVariantMap(userId, map)
      } else {
        await fetch(`${API_BASE}/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: pid, ean_code, image_url, color })
        })

        const rep =
          group.variants?.find((v) => String(v.ean_code || '') === ean_code) ||
          group.variants?.[0] ||
          group.rep ||
          group

        const payload = {
          ...rep,
          product_id: pid,
          ean_code,
          image_url,
          color: color || rep.color || rep.colour || ''
        }

        addToWishlist(payload)

        setLikedKeys((prev) => {
          const n = new Set(prev)
          n.add(k)
          return n
        })

        const map = readVariantMap(userId)
        map[k] = { image_url, ean_code, color: payload.color }
        writeVariantMap(userId, map)
      }
    } catch {}
  }

  const handleProductClick = (payload) => {
    sessionStorage.setItem('selectedProduct', JSON.stringify(payload))
    navigate('/checkout')
  }

  return (
    <div className="women-page">
      <Navbar />

      <div className="women-top-spacer" />

      <div id="products" className="women-page-main">
        <div className="women-page-content">
          {loading ? (
            <div className="women-state-card">Loading products…</div>
          ) : error ? (
            <div className="women-state-card error">{error}</div>
          ) : !allProducts.length ? (
            <EmptyState category={selectedCategory} />
          ) : !products.length ? (
            <EmptyState category={selectedCategory} />
          ) : (
            <WomenDisplayPage
              products={products}
              userType={userType}
              loading={loading}
              error={error}
              likedKeys={likedKeys}
              keyFor={keyFor}
              onToggleLike={toggleLike}
              onProductClick={handleProductClick}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}