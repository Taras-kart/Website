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

const buildBrandImage = (brand) => {
  const map = {
    'Twin Birds': '/images/updated/category-kurti-pant.webp',
    'Indian Flower': '/images/updated/category-leggin.webp',
    Intimacy: '/images/updated/category-metallic-pant.webp',
    'Naidu Hall': '/images/updated/category-plazzo-pant.webp',
    Aswathi: '/images/updated/category-saree-shaper.webp',
    Jockey: '/images/home/jockey3.webp'
  }
  return map[brand] || '/images/women/women20.jpeg'
}

const normalizeKey = (s) => String(s || '').trim().toLowerCase()

const deriveCategory = (p) => {
  const name = String(p?.product_name || '').trim()
  if (!name) return 'Others'
  const cleaned = name
    .replace(/\s+/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/[()]/g, ' ')
    .trim()
  const parts = cleaned.split(' ').filter(Boolean)
  const top = parts.slice(0, 3).join(' ')
  return top || 'Others'
}

const pickImageForProduct = (p) => {
  const ean = String(p?.ean_code || '').trim()
  const src = String(p?.image_url || '').trim()
  if (src) return src
  if (ean) return cloudinaryUrlByEan(ean)
  return DEFAULT_IMG
}

function BrowseBlocks({
  brand,
  blocks,
  currentCategory,
  onPickCategory
}) {
  const list = blocks || []
  return (
    <div className="women-browse">
      <div className="women-browse-head">
        <div className="women-browse-title">
          <span className="women-browse-badge">{brand || 'Women'}</span>
          <h3 className="women-browse-h">{brand ? 'Pick a category' : 'Browse by category'}</h3>
          {/*<p className="women-browse-sub">Tap a card to filter products for that category.</p> */}
          <span className="women-browse-badge">{brand || 'Women'}</span>
        </div>

        <div className="women-browse-actions">
          {currentCategory ? (
            <button type="button" className="women-browse-btn" onClick={() => onPickCategory('')}>
              Clear Category
            </button>
          ) : null}
          <Link to="/women" className="women-browse-btn primary">
            View All Brands
          </Link>
        </div>
      </div>

      <div className="women-browse-grid">
        {list.map((b) => (
          <button
            key={b.key}
            type="button"
            className={`women-mini-card${normalizeKey(currentCategory) === normalizeKey(b.title) ? ' active' : ''}`}
            onClick={() => onPickCategory(b.title)}
            title={b.title}
          >
            <div className="women-mini-media">
              <img
                src={b.image || DEFAULT_IMG}
                alt={b.title}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  if (e.currentTarget.src !== DEFAULT_IMG) e.currentTarget.src = DEFAULT_IMG
                }}
              />
              <div className="women-mini-overlay" />
              <div className="women-mini-title">{b.title}</div>
            </div>
            <div className="women-mini-meta">
              <span className="women-mini-count">{b.count} items</span>
              <span className="women-mini-cta">Shop</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ brand }) {
  const brands = ['Twin Birds', 'Naidu Hall', 'Intimacy', 'Aswathi', 'Indian Flower', 'Jockey']
  return (
    <div className="women-empty-wrap">
      <div className="women-empty-card">
        <div className="women-empty-top">
          <div className="women-empty-badge">No products found</div>
          <h3 className="women-empty-title">
            {brand ? (
              <>
                We couldn’t find items for <span className="women-empty-accent">{brand}</span>
              </>
            ) : (
              <>We couldn’t find items right now</>
            )}
          </h3>
          <p className="women-empty-sub">Try one of our popular brands, or explore the full women’s store.</p>
        </div>

        <div className="women-empty-actions">
          <Link to="/women" className="women-empty-btn primary">
            Explore Women’s Store
          </Link>
          <Link to="/" className="women-empty-btn">
            Back to Home
          </Link>
        </div>

        <div className="women-empty-grid">
          {brands.map((b) => (
            <Link key={b} to={`/women?brand=${encodeURIComponent(b)}`} className="women-empty-brand">
              <div className="women-empty-brandMedia">
                <img src={buildBrandImage(b)} alt={b} loading="lazy" decoding="async" />
                <div className="women-empty-brandOverlay" />
                <div className="women-empty-brandName">{b}</div>
              </div>
            </Link>
          ))}
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
  const [activeCategory, setActiveCategory] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { addToWishlist, wishlistItems, setWishlistItems } = useWishlist()

  const restoreDoneRef = useRef(false)
  const rafSaveRef = useRef(0)

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const selectedBrand = niceTitle(params.get('brand'))
  const selectedCategory = niceTitle(params.get('category'))

  useEffect(() => {
    setActiveCategory(selectedCategory)
  }, [selectedCategory])

  const headerTitle = selectedBrand ? `${selectedBrand} • Women` : "Women’s Collection"
  const headerSub = selectedBrand ? `Explore categories and latest picks from ${selectedBrand}` : 'Soft fabrics, sharp fits, all-day comfort'

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
        if (selectedBrand) {
          filtered = filtered.filter((x) => normalizeKey(x.brand) === normalizeKey(selectedBrand))
        }

        if (!cancelled) {
          setAllProducts(filtered)
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
  }, [selectedBrand])

  const categoryBlocks = useMemo(() => {
    const base = allProducts || []
    const map = new Map()
    for (const p of base) {
      const cat = deriveCategory(p)
      const key = normalizeKey(cat)
      if (!map.has(key)) {
        map.set(key, { key, title: cat, count: 0, image: pickImageForProduct(p) })
      }
      const obj = map.get(key)
      obj.count += 1
      if (!obj.image && p) obj.image = pickImageForProduct(p)
    }
    const list = Array.from(map.values())
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
    return list
  }, [allProducts])

  useEffect(() => {
    const base = allProducts || []
    const cat = niceTitle(activeCategory)
    const next = cat ? base.filter((p) => normalizeKey(deriveCategory(p)) === normalizeKey(cat)) : base
    setProducts(next)
  }, [allProducts, activeCategory])

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

  const pickCategory = (cat) => {
    const next = niceTitle(cat)
    setActiveCategory(next)
    const qs = new URLSearchParams(location.search)
    if (next) qs.set('category', next)
    else qs.delete('category')
    navigate({ pathname: '/women', search: qs.toString() ? `?${qs.toString()}` : '' }, { replace: true })
    const el = document.getElementById('products')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="women-page">
      <Navbar />

      <div className="women-top-spacer" />

      {/*<div className="women-hero">
        <div className="women-hero-inner">
          <div className="women-hero-left">
            <div className="women-hero-kicker">Women</div>
            <h1 className="women-hero-title">{headerTitle}</h1>
            <p className="women-hero-sub">{headerSub}</p>

            <div className="women-hero-actions">
              {selectedBrand ? (
                <>
                  <Link to="/women" className="women-hero-btn">
                    View All Brands
                  </Link>
                  <a href="#products" className="women-hero-btn primary">
                    Shop Now
                  </a>
                </>
              ) : (
                <a href="#products" className="women-hero-btn primary">
                  Browse Products
                </a>
              )}
            </div>
          </div>

          <div className="women-hero-right" aria-hidden="true">
            <div className="women-hero-card">
              <img
                src={selectedBrand ? buildBrandImage(selectedBrand) : '/images/home-screen-main.png'}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <div className="women-hero-glass" />
            </div>
          </div>
        </div>
      </div> */}

      <div id="products" className="women-page-main">
        <div className="women-page-content">
          {loading ? (
            <div className="women-state-card">Loading products…</div>
          ) : error ? (
            <div className="women-state-card error">{error}</div>
          ) : !allProducts.length ? (
            <EmptyState brand={selectedBrand} />
          ) : (
            <>
              <BrowseBlocks
                brand={selectedBrand}
                blocks={categoryBlocks}
                currentCategory={activeCategory}
                onPickCategory={pickCategory}
              />

              {!products.length ? (
                <div className="women-state-card">
                  No items match <b>{activeCategory}</b>. Try another category above.
                </div>
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
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}