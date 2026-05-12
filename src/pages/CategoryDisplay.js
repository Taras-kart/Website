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
  // ════════ TWIN BIRDS — LEGGING ════════
  { brand: 'TWIN BIRDS', parent: 'Legging', title: 'Viscose Ankle Legging', patterns: ['VISCOSE ANKLE LEGGING'] },
  { brand: 'TWIN BIRDS', parent: 'Legging', title: 'Cotton Ankle Legging', patterns: ['COTTON ANKLE LEGGING'] },
  { brand: 'TWIN BIRDS', parent: 'Legging', title: 'Viscose Chudidar Legging', patterns: ['VISCOSE CHUDIDAR LEGGING'] },
  { brand: 'TWIN BIRDS', parent: 'Legging', title: 'Cotton Chudidar Legging', patterns: ['COTTON CHUDIDAR LEGGING'] },
  { brand: 'TWIN BIRDS', parent: 'Legging', title: 'Capri Legging', patterns: ['CAPRI LEGGING'] },
  { brand: 'TWIN BIRDS', parent: 'Legging', title: 'Cropped Legging', patterns: ['CROPPED LEGGING'] },
  { brand: 'TWIN BIRDS', parent: 'Legging', title: 'Shimmer Legging', patterns: ['SHIMMER LEGGING'] },

  // ════════ TWIN BIRDS — KURTI PANT ════════
  { brand: 'TWIN BIRDS', parent: 'Kurti Pant', title: 'Cotton Straight Pant', patterns: ['COTTON STRAIGHT PANT'] },
  { brand: 'TWIN BIRDS', parent: 'Kurti Pant', title: 'Flexi Kurti Pant', patterns: ['FLEXI KURTI PANT'] },
  { brand: 'TWIN BIRDS', parent: 'Kurti Pant', title: 'Wide Leg Kurti', patterns: ['WIDE LEG KURTI'] },
  { brand: 'TWIN BIRDS', parent: 'Kurti Pant', title: 'Cotton Kurti', patterns: ['COTTON KURTI'] },
  { brand: 'TWIN BIRDS', parent: 'Kurti Pant', title: 'Sleek Kurti', patterns: ['SLEEK KURTI'] },
  { brand: 'TWIN BIRDS', parent: 'Kurti Pant', title: 'Metalic Pant', patterns: ['METALIC PANT'] },

  // ════════ TWIN BIRDS — JEGGING ════════
  { brand: 'TWIN BIRDS', parent: 'Jegging', title: 'Flexi Indigo Jeggings', patterns: ['FLEXI INDIGO JEGGINGS'] },
  { brand: 'TWIN BIRDS', parent: 'Jegging', title: 'Coloured Jegging', patterns: ['COLOURED JEGGING'] },

  // ════════ TWIN BIRDS — PLAZZO ════════
  { brand: 'TWIN BIRDS', parent: 'Plazzo', title: 'Plazo', patterns: ['PLAZO'] },

  // ════════ TWIN BIRDS — SAREE SHAPER ════════
  { brand: 'TWIN BIRDS', parent: 'Saree Shaper', title: 'Saree Skirt', patterns: ['SAREE SKIRT'] },
  { brand: 'TWIN BIRDS', parent: 'Saree Shaper', title: 'Saree Shaper', patterns: ['SAREE SHAPER'] },

  // ════════ TWIN BIRDS — SHAWL ════════
  { brand: 'TWIN BIRDS', parent: 'Shawl', title: 'Shimmer Shawl', patterns: ['SHIMMER SHAWL'] },
  { brand: 'TWIN BIRDS', parent: 'Shawl', title: 'Fashion Shawl', patterns: ['FASHION SHAWL'] },

  // ════════ TWIN BIRDS — SPORTS BRA ════════
  { brand: 'TWIN BIRDS', parent: 'Sports Bra', title: 'Elestic Sports Bra', patterns: ['ELESTIC SPORTS BRA'] },
  { brand: 'TWIN BIRDS', parent: 'Sports Bra', title: 'Stretch Sports Vest', patterns: ['STRETCH SPORTS VEST'] },

  // ════════ TWIN BIRDS — LOUNGE WEAR ════════
  { brand: 'TWIN BIRDS', parent: 'Lounge Wear', title: 'Plain Night Pant', patterns: ['PLAIN NIGHT PANT'] },
  { brand: 'TWIN BIRDS', parent: 'Lounge Wear', title: 'Textured Pant', patterns: ['TEXTURED PANT'] },
  { brand: 'TWIN BIRDS', parent: 'Lounge Wear', title: 'Plain Shorts', patterns: ['PLAIN SHORTS'] },
  { brand: 'TWIN BIRDS', parent: 'Lounge Wear', title: 'Printed Shorts', patterns: ['PRINTED SHORTS'] },
  { brand: 'TWIN BIRDS', parent: 'Lounge Wear', title: 'Printed Night Pant', patterns: ['PRINTED NIGHT PANT'] },
  { brand: 'TWIN BIRDS', parent: 'Lounge Wear', title: 'Printed T-Shirt', patterns: ['PRINTED T-SHIRT'] },
  { brand: 'TWIN BIRDS', parent: 'Lounge Wear', title: 'Collor Cord Set', patterns: ['COLLOR CORD SET'] },
  { brand: 'TWIN BIRDS', parent: 'Lounge Wear', title: 'Round Neck Cord Set', patterns: ['ROUND NECK CORD SET'] },
  { brand: 'TWIN BIRDS', parent: 'Lounge Wear', title: 'Easy Tees', patterns: ['EASY TEES'] },
  { brand: 'TWIN BIRDS', parent: 'Lounge Wear', title: 'Easy Pant', patterns: ['EASY PANT'] },

  // ════════ TWIN BIRDS — FALLBACKS ════════
  { brand: 'TWIN BIRDS', parent: 'Legging', title: 'Leggings', patterns: ['LEGGING'] },
  { brand: 'TWIN BIRDS', parent: 'Kurti Pant', title: 'Kurti Pants', patterns: ['KURTI PANT'] },
  { brand: 'TWIN BIRDS', parent: 'Jegging', title: 'Jeggings', patterns: ['JEGGING'] },
  { brand: 'TWIN BIRDS', parent: 'Plazzo', title: 'Plazzos', patterns: ['PLAZZO'] },
  { brand: 'TWIN BIRDS', parent: 'Shawl', title: 'Shawls', patterns: ['SHAWL'] },
  { brand: 'TWIN BIRDS', parent: 'Sports Bra', title: 'Sports Bras', patterns: ['SPORTS BRA'] },
  { brand: 'TWIN BIRDS', parent: 'Lounge Wear', title: 'Lounge Wear', patterns: ['LOUNGE WEAR'] },

  // ════════ NAIDU HALL ════════
  { brand: 'NAIDU HALL', parent: 'T-Shirt Bra', title: 'Candi', patterns: ['CNDI'] },

// ════════ INTIMACY — SPORTS BRA ════════
  { brand: 'INTIMACY', parent: 'Sports Bra', title: 'CA01', patterns: ['CA01'] },
  { brand: 'INTIMACY', parent: 'Sports Bra', title: 'CA05', patterns: ['CA05'] },
  { brand: 'INTIMACY', parent: 'Sports Bra', title: 'CA09', patterns: ['CA09'] },
  { brand: 'INTIMACY', parent: 'Sports Bra', title: 'CA11', patterns: ['CA11'] },
  { brand: 'INTIMACY', parent: 'Sports Bra', title: 'CA12', patterns: ['CA12'] },
  { brand: 'INTIMACY', parent: 'Sports Bra', title: 'BB01', patterns: ['BB01'] },

  // ════════ INTIMACY — EVERYDAY BRA ════════
  { brand: 'INTIMACY', parent: 'Everyday Bra', title: 'EC07', patterns: ['EC07'] },
  { brand: 'INTIMACY', parent: 'Everyday Bra', title: 'ES02', patterns: ['ES02'] },
  { brand: 'INTIMACY', parent: 'Everyday Bra', title: 'ES06', patterns: ['ES06'] },
  { brand: 'INTIMACY', parent: 'Everyday Bra', title: 'ES21', patterns: ['ES21'] },

  // ════════ INTIMACY — PADDED BRA ════════
  { brand: 'INTIMACY', parent: 'Padded Bra', title: 'EC06', patterns: ['EC06'] },
  { brand: 'INTIMACY', parent: 'Padded Bra', title: 'UC02', patterns: ['UC02'] },
  { brand: 'INTIMACY', parent: 'Padded Bra', title: 'UC09', patterns: ['UC09'] },

  // ════════ INTIMACY — DEF COLLECTION ════════
  { brand: 'INTIMACY', parent: 'DEF Collection', title: 'DEFM', patterns: ['DEFM'] },
  { brand: 'INTIMACY', parent: 'DEF Collection', title: 'DEFT', patterns: ['DEFT'] },

  // ════════ INTIMACY — FEEDING BRA ════════
  { brand: 'INTIMACY', parent: 'Feeding Bra', title: 'F909', patterns: ['F909'] },
  { brand: 'INTIMACY', parent: 'Feeding Bra', title: 'IN21', patterns: ['IN21'] },

  // ════════ INTIMACY — SLIPS ════════
  { brand: 'INTIMACY', parent: 'Slips', title: 'IN15', patterns: ['IN15'] },
  { brand: 'INTIMACY', parent: 'Slips', title: '3NSL', patterns: ['3NSL'] },
  { brand: 'INTIMACY', parent: 'Slips', title: 'NGSL', patterns: ['NGSL'] },

  // ════════ INDIAN FLOWER — LEGGING ════════
  { brand: 'INDIAN FLOWER', parent: 'Legging', title: 'Chudidar Legging', patterns: ['CHUDIDAR LEGGING'] },
  { brand: 'INDIAN FLOWER', parent: 'Legging', title: 'Ankle Legging', patterns: ['ANKLE LEGGING'] },

  // ════════ INDIAN FLOWER — SAREE SHAPER ════════
 { brand: 'INDIAN FLOWER', parent: null, title: 'Saree Shaper', patterns: ['SAREE SHAPPER', 'SAREE SHAPER'] },

// ════════ ASWATI — BRA ════════
  { brand: 'ASWATI', parent: 'Bra', title: '888 Bra', patterns: ['888'] },
  { brand: 'ASWATI', parent: 'Bra', title: 'Moulded Bra', patterns: ['MOULDED'] },
  { brand: 'ASWATI', parent: 'Bra', title: 'Sports Bra', patterns: ['SPORTS'] },
  { brand: 'ASWATI', parent: 'Bra', title: 'Sweety Bra', patterns: ['SWEETY'] },

  // ════════ ASWATI — PANTY ════════
  { brand: 'ASWATI', parent: 'Panty', title: 'Mody Plain', patterns: ['MODY PLAIN'] },
  { brand: 'ASWATI', parent: 'Panty', title: 'Mody Print', patterns: ['MODY PRINT'] },
  { brand: 'ASWATI', parent: 'Panty', title: 'Priya Plain', patterns: ['PRIYA PLAIN'] },
  { brand: 'ASWATI', parent: 'Panty', title: 'Priya Print', patterns: ['PRIYA PRINT'] },

  // ════════ ASWATI — YOGA SHORTS (direct) ════════
  { brand: 'ASWATI', parent: null, title: 'Yoga Shorts', patterns: ['YOGA SHORTS'] },

  // ════════ ASWATI — SLIP ════════
  { brand: 'ASWATI', parent: 'Slip', title: 'Angel Bra Slip', patterns: ['ANGEL BRA SLIP'] },
  { brand: 'ASWATI', parent: 'Slip', title: 'Cindrella', patterns: ['CINDRELLA'] },
  { brand: 'ASWATI', parent: 'Slip', title: 'Karishma WBS', patterns: ['KARISHMA WBS'] },
  { brand: 'ASWATI', parent: 'Slip', title: 'Karishma', patterns: ['KARISHMA'] },
  { brand: 'ASWATI', parent: 'Slip', title: 'Lotus', patterns: ['LOTUS'] },
  { brand: 'ASWATI', parent: 'Slip', title: 'Nighty Slip', patterns: ['NIGHTY SLIP'] },
  { brand: 'ASWATI', parent: 'Slip', title: 'Princess', patterns: ['PRINCESS'] },
  { brand: 'ASWATI', parent: 'Slip', title: 'Queen Bra Slip', patterns: ['QUEEN BRA SLIP'] },
  { brand: 'ASWATI', parent: 'Slip', title: 'Saniya', patterns: ['SANIYA'] },
]

const deriveCategoryData = (p) => {
  const name = String(p?.product_name || '').trim()
  const brand = String(p?.brand || p?.brand_name || '').trim().toUpperCase()
  if (!name) return null
  const up = name.replace(/\s+/g, ' ').trim().toUpperCase()

  for (const g of CATEGORY_GROUPS) {
    // If group has a brand, it must match
    if (g.brand && g.brand.toUpperCase() !== brand) continue
    for (const pat of g.patterns) {
      const t = String(pat || '').trim().toUpperCase()
      if (t && up.includes(t)) return { parent: g.parent, title: g.title }
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