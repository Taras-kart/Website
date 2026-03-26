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
const CATEGORY_GROUPS = [
  // ════════ LEGGING ════════
  { parent: 'Legging', title: 'Viscose Ankle Legging', img: '/images/updated/Viscose_Ankle_Legging.webp', patterns: ['VISCOSE ANKLE LEGGING'] },
  { parent: 'Legging', title: 'Cotton Ankle Legging', img: '/images/updated/Cotton_Ankle_Legging.webp', patterns: ['COTTON ANKLE LEGGING'] },
  { parent: 'Legging', title: 'Viscose Chudidar Legging', img: '/images/updated/Viscose_Churidar_Legging.webp', patterns: ['VISCOSE CHUDIDAR LEGGING'] },
  { parent: 'Legging', title: 'Cotton Chudidar Legging', img: '/images/updated/Cotton_Churidar_Legging.webp', patterns: ['COTTON CHUDIDAR LEGGING'] },
  { parent: 'Legging', title: 'Capri Legging', img: '/images/updated/Cotton_Capri_Legging.webp', patterns: ['CAPRI LEGGING'] },
  { parent: 'Legging', title: 'Cropped Legging', img: '/images/updated/Cropped_Leggings.webp', patterns: ['CROPPED LEGGING'] },
  { parent: 'Legging', title: 'Shimmer Legging', img: '/images/updated/Shimmer_Legging.webp', patterns: ['SHIMMER LEGGING'] },

  // ════════ KURTI PANT ════════
  { parent: 'Kurti Pant', title: 'Cotton Straight Pant', img: null, patterns: ['COTTON STRAIGHT PANT'] },
  { parent: 'Kurti Pant', title: 'Flexi Kurti Pant', img: '/images/updated/flexi_kurti_pant.webp', patterns: ['FLEXI KURTI PANT'] },
  { parent: 'Kurti Pant', title: 'Wide Leg Kurti', img: '/images/updated/flexi_kurti_pant.webp', patterns: ['WIDE LEG KURTI'] },
  { parent: 'Kurti Pant', title: 'Cotton Kurti', img: '/images/updated/cotton_kurti_pant.webp', patterns: ['COTTON KURTI'] },
  { parent: 'Kurti Pant', title: 'Sleek Kurti', img: '/images/updated/sleek_kurti_pant.webp', patterns: ['SLEEK KURTI'] },
  { parent: 'Kurti Pant', title: 'Metalic Pant', img: '/images/updated/metallic_straight_pant.webp', patterns: ['METALIC PANT'] },

  // ════════ JEGGING ════════
  { parent: 'Jegging', title: 'Flexi Indigo Jeggings', img: null, patterns: ['FLEXI INDIGO JEGGINGS'] },
  { parent: 'Jegging', title: 'Coloured Jegging', img: null, patterns: ['COLOURED JEGGING'] },

  // ════════ PLAZZO ════════
  { parent: 'Plazzo', title: 'Plazo', img: '/images/updated/Solid_Wide_Leg_Palazzo.webp', patterns: ['PLAZO'] },

  // ════════ SAREE SHAPER ════════
  { parent: 'Saree Shaper', title: 'Saree Skirt', img: '/images/updated/Skirt_Shaper.webp', patterns: ['SAREE SKIRT'] },
  { parent: 'Saree Shaper', title: 'Saree Shaper', img: '/images/updated/Saree_Shaper.webp', patterns: ['SAREE SHAPER'] },

  // ════════ SHAWL ════════
  { parent: 'Shawl', title: 'Shimmer Shawl', img: null, patterns: ['SHIMMER SHAWL'] },
  { parent: 'Shawl', title: 'Fashion Shawl', img: null, patterns: ['FASHION SHAWL'] },

  // ════════ SPORTS BRA ════════
  { parent: 'Sports Bra', title: 'Elestic Sports Bra', img: null, patterns: ['ELESTIC SPORTS BRA'] },
  { parent: 'Sports Bra', title: 'Stretch Sports Vest', img: null, patterns: ['STRETCH SPORTS VEST'] },

  // ════════ LOUNGE WEAR ════════
  { parent: 'Lounge Wear', title: 'Plain Night Pant', img: null, patterns: ['PLAIN NIGHT PANT'] },
  { parent: 'Lounge Wear', title: 'Textured Pant', img: null, patterns: ['TEXTURED PANT'] },
  { parent: 'Lounge Wear', title: 'Plain Shorts', img: null, patterns: ['PLAIN SHORTS'] },
  { parent: 'Lounge Wear', title: 'Printed Shorts', img: null, patterns: ['PRINTED SHORTS'] },
  { parent: 'Lounge Wear', title: 'Printed Night Pant', img: null, patterns: ['PRINTED NIGHT PANT'] },
  { parent: 'Lounge Wear', title: 'Printed T-Shirt', img: null, patterns: ['PRINTED T-SHIRT'] },
  { parent: 'Lounge Wear', title: 'Collor Cord Set', img: null, patterns: ['COLLOR CORD SET'] },
  { parent: 'Lounge Wear', title: 'Round Neck Cord Set', img: null, patterns: ['ROUND NECK CORD SET'] },
  { parent: 'Lounge Wear', title: 'Easy Tees', img: null, patterns: ['EASY TEES'] },
  { parent: 'Lounge Wear', title: 'Easy Pant', img: null, patterns: ['EASY PANT'] },

  // ════════ EXACT PARENT MATCHES (FALLBACKS) ════════
  // These MUST be at the bottom. If the product is just named "LEGGING", it lands here.
  { parent: 'Legging', title: 'Leggings', img: null, patterns: ['LEGGING'] },
  { parent: 'Kurti Pant', title: 'Kurti Pants', img: null, patterns: ['KURTI PANT'] },
  { parent: 'Jegging', title: 'Jeggings', img: null, patterns: ['JEGGING'] },
  { parent: 'Plazzo', title: 'Plazzos', img: null, patterns: ['PLAZZO'] },
  { parent: 'Shawl', title: 'Shawls', img: null, patterns: ['SHAWL'] },
  { parent: 'Sports Bra', title: 'Sports Bras', img: null, patterns: ['SPORTS BRA'] },
  { parent: 'Lounge Wear', title: 'Lounge Wear', img: null, patterns: ['LOUNGE WEAR'] }
];
const deriveCategoryData = (p) => {
  const name = String(p?.product_name || '').trim()
  if (!name) return null
  const up = name.replace(/\s+/g, ' ').trim().toUpperCase()
  for (const g of CATEGORY_GROUPS) {
    for (const pat of g.patterns) {
      const t = String(pat || '').trim().toUpperCase()
      if (t && up.includes(t)) return { parent: g.parent, title: g.title, img: g.img }
    }
  }
  return null
}

const pickImageForCategory = (title, firstProduct) => {
  const ean = String(firstProduct?.ean_code || '').trim()
  const src = String(firstProduct?.image_url || '').trim()
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

  // ── BACK-BUTTON FIX ──────────────────────────────────────────
  // selectedParent is now URL-driven instead of React state.
  // Drilling in pushes a history entry, so the browser back button
  // naturally pops back to the parent-category grid.
  const selectedParent = niceTitle(params.get('parent'))

  const drillIntoParent = (title) => {
    const sp = new URLSearchParams(location.search)
    sp.set('parent', title)
    navigate({ pathname: '/category-display', search: sp.toString() })
  }

  // ─────────────────────────────────────────────────────────────

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
    return () => { cancelled = true }
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
      const catData = deriveCategoryData(p)
      if (!catData) continue
      const key = normalizeKey(catData.title)
      if (!key) continue
      const displayTitle = !selectedParent && catData.parent ? catData.parent : catData.title
      const displayKey = normalizeKey(displayTitle)
      if (selectedParent && catData.parent !== selectedParent) continue
      if (!map.has(displayKey)) {
        map.set(displayKey, {
          key: displayKey,
          title: displayTitle,
          isParentNode: !selectedParent && !!catData.parent,
          count: 0,
          image: catData.img || pickImageForCategory(catData.title, p)
        })
      }
      const obj = map.get(displayKey)
      obj.count += 1
    }
    return Array.from(map.values())
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
  }, [filteredProducts, selectedParent])

  const openCategory = (catObj) => {
    if (catObj.isParentNode) {
      // ── BACK-BUTTON FIX: navigate instead of setState ──
      drillIntoParent(catObj.title)
    } else {
      const matchingVariants = filteredProducts.filter((p) => {
        const pCat = deriveCategoryData(p)
        if (!pCat) return false
        return normalizeKey(pCat.title) === normalizeKey(catObj.title)
      })
      if (matchingVariants.length > 0) {
        const baseProduct = matchingVariants[0]
        const uniqueImages = new Set()
        matchingVariants.forEach((v) => {
          const img = v.image_url || pickImageForCategory(catObj.title, v)
          if (img && img !== DEFAULT_IMG) uniqueImages.add(img)
        })
        const payload = {
          ...baseProduct,
          variants: matchingVariants,
          images: Array.from(uniqueImages).length > 0 ? Array.from(uniqueImages) : [catObj.image || DEFAULT_IMG]
        }
        sessionStorage.setItem('selectedProduct', JSON.stringify(payload))
        navigate('/checkout')
      } else {
        const qs = new URLSearchParams()
        if (selectedBrand) qs.set('brand', selectedBrand)
        qs.set('category', catObj.title)
        navigate(`/women?${qs.toString()}`)
      }
    }
  }

  const goAllProducts = () => {
    if (selectedBrand) navigate(`/women?brand=${encodeURIComponent(selectedBrand)}`)
    else navigate('/women')
  }

  const goAllCategories = () => {
    navigate('/category-display')
  }

  // ── Grid sizing ───────────────────────────────────────────────
  // Cap at 8 columns max. When ≤3 cards, apply a "few" class
  // so cards don't stretch across the full 1300px viewport.
  const colCount = Math.min(Math.max(categories.length, 1), 8)
  const isFewCards = colCount <= 3
  const skeletonCols = 7

  return (
    <div className="category-page">
      <Navbar />
      <div className="category-top-spacer" />

      <div className="category-wrap">
        {loading ? (
          <div className="category-grid" style={{ '--cols': skeletonCols }}>
            {Array.from({ length: skeletonCols }).map((_, i) => (
              <div key={i} className="category-card category-card--skeleton" style={{ '--i': i }}>
                <div className="category-media">
                  <div className="category-skeleton-fill" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="category-state error">{error}</div>
        ) : !categories.length ? (
          <div className="category-state">
            <p className="category-empty-title">No categories found</p>
            <p className="category-empty-sub">
              {selectedBrand ? 'Try another brand, or view all women products.' : 'Try viewing all products.'}
            </p>
            <div className="category-empty-actions">
              <button type="button" className="category-viewall" onClick={goAllProducts}>View All Products</button>
              {selectedBrand && (
                <button type="button" className="category-ghost" onClick={goAllCategories}>Clear Brand</button>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`category-grid${isFewCards ? ' category-grid--few' : ''}`}
            style={{ '--cols': colCount }}
          >
            {categories.map((c, idx) => (
              <button
                key={c.key}
                type="button"
                className={`category-card${c.isParentNode ? ' category-card--folder' : ''}`}
                style={{ '--i': idx }}
                onClick={() => openCategory(c)}
                title={c.title}
              >
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
                  <div className="category-overlay" aria-hidden="true" />
                  {c.isParentNode && (
                    <span className="category-folder-pip" aria-hidden="true">›</span>
                  )}
                  <div className="category-label">
                    <span className="category-label-text">{c.title}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}