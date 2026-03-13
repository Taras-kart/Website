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
  // --- LEGGINGS & SUBCATEGORIES ---
  {
    parent: 'Leggings', 
    title: 'Ankle Leggings', 
    img: '/images/updated/ankle-leggings.webp', 
    patterns: ['ANKLE LEGGING'] 
  },
  {
    parent: 'Leggings', 
    title: 'Capri', 
    img: '/images/updated/capri-leggings.webp', 
    patterns: ['CAPRI LEGGINGS', 'CAPRI'] 
  },
  { 
    parent: 'Leggings', 
    title: 'Chudidar Leggings', 
    img: '/images/updated/chudidar-leggings.webp', 
    patterns: ['CHUDIDAR LEGGING'] 
  },
  { 
    parent: 'Leggings', 
    title: 'Cropped Leggings', 
    img: '/images/updated/cropped-leggings.webp', 
    patterns: ['CROPPED LEGGING'] 
  },
  { 
    parent: 'Leggings', 
    title: 'Shimmer Leggings', 
    img: '/images/updated/shimmer-leggings.webp', 
    patterns: ['SHIMMER LEGGINGS'] 
  },
  { 
    parent: 'Leggings', 
    title: 'Basic Leggings', 
    img: '/images/updated/category-leggin.webp', 
    patterns: ['LEGGING'] 
  },
  // --- KURTI PANTS & SUBCATEGORIES ---
  { parent: 'Kurti Pants', title: 'Sleek Kurti Pants', img: '/images/updated/category-kurti-pant.webp', patterns: ['SLEEK KURTI'] },
  { parent: 'Kurti Pants', title: 'Wide Leg Kurti', img: '/images/updated/category-kurti-pant.webp', patterns: ['WIDE LEG KURTI'] },
  { parent: 'Kurti Pants', title: 'Cotton Kurti', img: '/images/updated/category-kurti-pant.webp', patterns: ['COTTON KURTI'] },
  { parent: 'Kurti Pants', title: 'Flexi Kurti Pant', img: '/images/updated/category-kurti-pant.webp', patterns: ['FLEXI KURTI PANT'] },
  { parent: 'Kurti Pants', title: 'Basic Kurti Pants', img: '/images/updated/category-kurti-pant.webp', patterns: ['KURTI PANT'] },

  // --- DENIM & SUBCATEGORIES ---
  { parent: 'Denim', title: 'Denim Jackets', img: '/images/updated/denim.webp', patterns: ['DENIM JACKET'] },
  { parent: 'Denim', title: 'High Waist Denim', img: '/images/updated/denim.webp', patterns: ['HIGH WAIST DENIM'] },
  { parent: 'Denim', title: 'Basic Denim', img: '/images/updated/denim.webp', patterns: ['DENIM'] },

  // --- BRA & INNERWEAR SUBCATEGORIES ---
  { parent: 'Bra', title: 'Elastic Sports Bra', img: '/images/updated/inner3.jpg', patterns: ['ELESTIC SPORTS BRA'] },
  { parent: 'Bra', title: 'Sports Bra', img: '/images/updated/inner3.jpg', patterns: ['SPORTS BRA'] },
  { parent: 'Bra', title: 'Sports Vest', img: '/images/updated/inner3.jpg', patterns: ['SPORTS VEST'] },
  { parent: 'Bra', title: 'Basic Bra', img: '/images/updated/inner3.jpg', patterns: ['BRA'] },

  // --- JEGGINGS & SUBCATEGORIES ---
  { parent: 'Jeggings', title: 'Coloured Jeggings', img: '/images/updated/category-metallic-pant.webp', patterns: ['COLOURED JEGGING'] },
  { parent: 'Jeggings', title: 'Basic Jeggings', img: '/images/updated/category-metallic-pant.webp', patterns: ['JEGGING'] },

  // --- SAREE SHAPER & SUBCATEGORIES ---
  { parent: 'Saree Shaper', title: 'Saree Skirt', img: '/images/updated/category-saree-shaper.webp', patterns: ['SAREE SKIRT'] },
  { parent: 'Saree Shaper', title: 'Basic Saree Shaper', img: '/images/updated/category-saree-shaper.webp', patterns: ['SAREE SHAPER'] },

  // --- T-SHIRTS & SUBCATEGORIES ---
  { parent: 'T-shirt', title: 'Active Wear T-shirt', img: '/images/updated/t-shirt1.webp', patterns: ['ACTIVE WEAR T-SHIRT'] },
  { parent: 'T-shirt', title: 'Basic T-shirt', img: '/images/updated/t-shirt1.webp', patterns: ['T-SHIRT', 'T SHIRT'] },

  // --- SHIMMER & SUBCATEGORIES ---
  { parent: 'Shimmer', title: 'Shimmer Shawl', img: '/images/updated/category-metallic-pant.webp', patterns: ['SHIMMER SHAWL'] },
  { parent: 'Shimmer', title: 'Basic Shimmer', img: '/images/updated/category-metallic-pant.webp', patterns: ['SHIMMER'] },

  // --- SINGLE CATEGORIES (No Drill-Down Needed) ---
  { parent: null, title: 'Plazo', img: '/images/updated/category-plazzo-pant.webp', patterns: ['PLAZO', 'PALAZZO'] },
  { parent: null, title: 'Cycling Shorts', img: '/images/updated/inner5.jpg', patterns: ['CYCLING SHORTS'] },
  { parent: null, title: 'Metallic Pants', img: '/images/updated/category-metallic-pant.webp', patterns: ['METALIC PANT', 'METALLIC PANT'] }
]

// 2. UPDATED: Returns parent and child data
const deriveCategoryData = (p) => {
  const name = String(p?.product_name || '').trim()
  if (!name) return { parent: null, title: '' }
  const up = name.replace(/\s+/g, ' ').trim().toUpperCase()

  for (const g of CATEGORY_GROUPS) {
    for (const pat of g.patterns) {
      const t = String(pat || '').trim().toUpperCase()
      if (t && up.includes(t)) return { parent: g.parent, title: g.title, img: g.img }
    }
  }
  return { parent: null, title: niceTitle(name), img: '' }
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
  
  // 3. NEW: State to track if we drilled down into a parent category
  const [selectedParent, setSelectedParent] = useState(null)
  
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

  // 4. UPDATED: Groups categories based on if we are drilled down or not
  const categories = useMemo(() => {
    const map = new Map()
    for (const raw of filteredProducts || []) {
      const p = raw || {}
      const catData = deriveCategoryData(p)
      const key = normalizeKey(catData.title)
      if (!key) continue

      // If no parent is selected, show parent groups. If parent IS selected, show its children.
      const displayTitle = !selectedParent && catData.parent ? catData.parent : catData.title
      const displayKey = normalizeKey(displayTitle)

      // If we are drilled down, ignore products that don't belong to this parent
      if (selectedParent && catData.parent !== selectedParent) continue

      if (!map.has(displayKey)) {
        map.set(displayKey, {
          key: displayKey,
          title: displayTitle,
          isParentNode: !selectedParent && !!catData.parent, // Tells the card to act as a folder
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

  // 5. UPDATED: Click handler logic
  const openCategory = (catObj) => {
    if (catObj.isParentNode) {
      // Drill down into subcategories!
      setSelectedParent(catObj.title)
    } else {
      // Navigate to products!
      const qs = new URLSearchParams()
      if (selectedBrand) qs.set('brand', selectedBrand)
      qs.set('category', catObj.title)
      navigate(`/women?${qs.toString()}`)
    }
  }

  const goAllProducts = () => {
    if (selectedBrand) navigate(`/women?brand=${encodeURIComponent(selectedBrand)}`)
    else navigate('/women')
  }

  const goAllCategories = () => {
    setSelectedParent(null) // Reset drill-down
    navigate('/category-display')
  }

  const headerTitle = selectedBrand ? `${selectedBrand} Categories` : 'Women Categories'
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
                <span className="category-center-text">{selectedParent || selectedBrand || 'Brand Categories'}</span>
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
                {/* 6. NEW: Back Button when drilled down */}
                {selectedParent && (
                  <button type="button" className="category-ghost" onClick={() => setSelectedParent(null)}>
                    ← Back to Main Categories
                  </button>
                )}
                <span className="category-toolbar-count">{categories.length} categories</span>
                <span className="category-toolbar-hint">Tap a card to {selectedParent ? 'shop' : 'explore'}</span>
              </div>
              <div className="category-toolbar-right">
                <button type="button" className="category-mini" onClick={goAllProducts}>
                  Go to Products
                </button>
              </div>
            </div>

            <div className="category-grid">
              {categories.map((c) => (
                <button key={c.key} type="button" className="category-card" onClick={() => openCategory(c)} title={c.title}>
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
                    <span className="category-cta">{c.isParentNode ? 'Explore' : 'Shop'}</span>
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