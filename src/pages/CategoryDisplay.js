import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import './CategoryDisplay.css'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

const CLOUD_NAME = 'deymt9uyh'
const DEFAULT_IMG = '/images/women/women20.jpeg'
const toArray = (x) => (Array.isArray(x) ? x : [])
const normalizeKey = (s) => String(s || '').trim().toLowerCase()
const niceTitle = (s) => String(s || '').trim()

function cloudinaryUrlByEan(ean) {
  if (!ean) return ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/products/${ean}`
}

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

export default function CategoryDisplay() {
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const selectedBrand = niceTitle(params.get('brand'))

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/products?gender=WOMEN&limit=50000&_t=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        if (!cancelled) setAllProducts(toArray(data))
      } catch {
        if (!cancelled) {
          setAllProducts([])
          setError('Unable to load categories')
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

  const filteredProducts = useMemo(() => {
    const list = allProducts || []
    if (!selectedBrand) return list
    const b = normalizeKey(selectedBrand)
    return list.filter((p) => normalizeKey(p?.brand ?? p?.brand_name ?? '') === b)
  }, [allProducts, selectedBrand])

  const categories = useMemo(() => {
    const map = new Map()
    for (const raw of filteredProducts || []) {
      const p = raw || {}
      const cat = deriveCategory(p)
      const key = normalizeKey(cat)
      if (!map.has(key)) {
        map.set(key, {
          key,
          title: cat,
          count: 0,
          image: pickImageForProduct(p)
        })
      }
      const obj = map.get(key)
      obj.count += 1
      if (!obj.image) obj.image = pickImageForProduct(p)
    }
    return Array.from(map.values())
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
  }, [filteredProducts])

  const openCategory = (title) => {
    const qs = new URLSearchParams()
    if (selectedBrand) qs.set('brand', selectedBrand)
    qs.set('category', title)
    navigate(`/women?${qs.toString()}`)
  }

  const goAllProducts = () => {
    if (selectedBrand) navigate(`/women?brand=${encodeURIComponent(selectedBrand)}`)
    else navigate('/women')
  }

  const goAllCategories = () => {
    navigate('/category-display')
  }

  const headerTitle = selectedBrand ? `${selectedBrand} Categories` : 'Women Categories'
  //const headerPill = selectedBrand ? selectedBrand : 'Women'
  const subtitle = selectedBrand ? 'Choose a category for this brand' : 'Pick a category to see matching products'

  return (
    <div className="category-page">
      <Navbar />
      <div className="category-top-spacer" />

      <div className="category-hero">
        <div className="category-hero-inner">
          <div className="category-hero-glow" />
          <div className="category-hero-row">
            <div className="category-hero-left">
              <h2 className="category-title">{headerTitle}</h2>
              <p className="category-sub">{subtitle}</p>
            </div>

            <div className="category-hero-center">
              <div className="category-center-badge">
                <span className="category-center-dot" />
                <span className="category-center-text">{selectedBrand || 'Brand Categories'}</span>
              </div>
            </div>

            <div className="category-hero-right">
              <button type="button" className="category-viewall" onClick={goAllProducts}>
                View All Products
              </button>
              {selectedBrand ? (
                <button type="button" className="category-ghost" onClick={goAllCategories}>
                  Clear Brand
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="category-wrap">
        {loading ? (
          <div className="category-state">Loading categories…</div>
        ) : error ? (
          <div className="category-state error">{error}</div>
        ) : !categories.length ? (
          <div className="category-state">
            <div className="category-empty-title">No categories found</div>
            <div className="category-empty-sub">
              {selectedBrand ? `Try another brand, or view all women products.` : `Try viewing all products.`}
            </div>
            <div className="category-empty-actions">
              <button type="button" className="category-viewall" onClick={goAllProducts}>
                View All Products
              </button>
              {selectedBrand ? (
                <button type="button" className="category-ghost" onClick={goAllCategories}>
                  Clear Brand
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <div className="category-toolbar">
              <div className="category-toolbar-left">
                <span className="category-toolbar-count">{categories.length} categories</span>
                <span className="category-toolbar-hint">Tap a card to shop</span>
              </div>
              <div className="category-toolbar-right">
                <button type="button" className="category-mini" onClick={goAllProducts}>
                  Go to Products
                </button>
              </div>
            </div>

            <div className="category-grid">
              {categories.map((c) => (
                <button key={c.key} type="button" className="category-card" onClick={() => openCategory(c.title)} title={c.title}>
                  <div className="category-media">
                    <img
                      src={c.image || DEFAULT_IMG}
                      alt={c.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (e.currentTarget.src !== DEFAULT_IMG) e.currentTarget.src = DEFAULT_IMG
                      }}
                    />
                    <div className="category-overlay" />
                    <div className="category-name">{c.title}</div>
                    <div className="category-float">
                      <span className="category-float-count">{c.count}</span>
                      <span className="category-float-label">items</span>
                    </div>
                  </div>

                  <div className="category-meta">
                    <span className="category-count">{c.count} items</span>
                    <span className="category-cta">Shop</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}