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
  // --- SAREE SHAPER ---
  { parent: 'Saree Shaper', title: 'Saree Shaper', img: '/images/updated/Saree_Shaper.webp', patterns: ['SAREE SHAPER', 'SAREESHAPER'] },
  { parent: 'Saree Shaper', title: 'Skirt Shaper', img: '/images/updated/Skirt_Shaper.webp', patterns: ['SKIRT SHAPER', 'SKIRTSHAPER', 'SAREE SKIRT', 'SAREESKIRT'] },
  { parent: 'Saree Shaper', title: 'Straight Fit Saree Shaper', img: '/images/updated/StraightFit_Saree_Shaper.webp', patterns: ['STRAIGHT FIT', 'STRAIGHTFIT'] },

  // --- KURTI PANTS ---
  { parent: 'Kurti Pants', title: 'Viscose Kurti Pant', img: '/images/updated/viscose_kurti_pant.webp', patterns: ['VISCOSE KURTI', 'VISCOSEKURTI'] },
  { parent: 'Kurti Pants', title: 'Cotton Kurti Pant', img: '/images/updated/cotton_kurti_pant.webp', patterns: ['COTTON KURTI', 'COTTONKURTI'] },
  { parent: 'Kurti Pants', title: 'Sleek Kurti Pant', img: '/images/updated/sleek_kurti_pant.webp', patterns: ['SLEEK KURTI', 'SLEEKKURTI'] },
  { parent: 'Kurti Pants', title: 'Flexi Kurti Pant', img: '/images/updated/flexi_kurti_pant.webp', patterns: ['FLEXI KURTI', 'FLEXIKURTI', 'WIDE LEG KURTI', 'WIDELEGKURTI'] },
  // Catch-all for generic Kurtis in DB
  { parent: 'Kurti Pants', title: 'Viscose Kurti Pant', img: '/images/updated/kurti_pant.webp', patterns: ['KURTI PANT', 'KURTIPANT', 'KURTI'] }, 

  // --- LEGGINGS (Ordered from most specific to generic) ---
  { parent: 'Leggings', title: 'Viscose Churidar Legging', img: '/images/updated/Viscose_Churidar_Legging.webp', patterns: ['VISCOSE CHURIDAR', 'VISCOSECHURIDAR', 'VISCOSE CHUDIDAR', 'VISCOSECHUDIDAR'] },

{ parent: 'Leggings', title: 'Bamboo Modal Churidar Legging', img: '/images/updated/BambooModal_Churidar_Legging.webp', patterns: ['BAMBOO MODAL CHURIDAR', 'BAMBOOMODALCHURIDAR', 'BAMBOO MODAL CHUDIDAR', 'BAMBOOMODALCHUDIDAR'] },

{ parent: 'Leggings', title: 'Cotton Capri Legging', img: '/images/updated/Cotton_Capri_Legging.webp', patterns: ['COTTON CAPRI', 'COTTONCAPRI', 'CAPRI'] },

{ parent: 'Leggings', title: 'Viscose Ankle Legging', img: '/images/updated/Viscose_Ankle_Legging.webp', patterns: ['VISCOSE ANKLE', 'VISCOSEANKLE'] },

{ parent: 'Leggings', title: 'Viscose 7/8 High Ankle/Cropped Leggings', img: '/images/updated/Viscose7-8_HighAnkle(or)Cropped_Legging.webp', patterns: ['VISCOSE 7/8', 'VISCOSE7/8', 'CROPPED', 'HIGH ANKLE', 'HIGHANKLE'] },

{ parent: 'Leggings', title: 'Bamboo Modal Ankle Legging', img: '/images/updated/BambooModal_Ankle_Legging.webp', patterns: ['BAMBOO MODAL ANKLE', 'BAMBOOMODALANKLE'] },

{ parent: 'Leggings', title: 'Cotton Churidar Legging', img: '/images/updated/Cotton_Churidar_Legging.webp', patterns: ['COTTON CHURIDAR', 'COTTONCHURIDAR', 'COTTON CHUDIDAR', 'COTTONCHUDIDAR', 'CHURIDAR', 'CHUDIDAR'] },

{ parent: 'Leggings', title: 'Shimmer Legging', img: '/images/updated/Shimmer_Legging.webp', patterns: ['SHIMMER LEGGING', 'SHIMMERLEGGING', 'SHIMMER'] },
  // Catch-all for generic Leggings in DB
  { parent: 'Leggings', title: 'Cotton Ankle Legging', img: '/images/updated/Cotton_Ankle_Legging.webp', patterns: ['COTTON ANKLE', 'COTTONANKLE', 'ANKLE', 'LEGGING'] },

  // --- PALAZZO PANTS ---
 { parent: 'Palazzo Pants', title: 'Solid Knitted Palazzo Pants', img: '/images/updated/Solid_knitted_Palazzo_Pants.webp', patterns: ['SOLID KNITTED', 'SOLIDKNITTED'] },

{ parent: 'Palazzo Pants', title: 'Printed Knitted Palazzo Pants', img: '/images/updated/Printed_Knitted_Palazzo_Pants.webp', patterns: ['PRINTED KNITTED', 'PRINTEDKNITTED'] },

{ parent: 'Palazzo Pants', title: 'Knotted Striped Palazzo', img: '/images/updated/Knotted_Striped_Palazzo.webp', patterns: ['KNOTTED STRIPED', 'KNOTTEDSTRIPED', 'KNOTTED'] },

{ parent: 'Palazzo Pants', title: 'Striped Palazzo', img: '/images/updated/Striped_Palazzo.webp', patterns: ['STRIPED'] },

// Catch-all for generic Palazzos
{ parent: 'Palazzo Pants', title: 'Solid Wide Leg Palazzo', img: '/images/updated/Solid_Wide_Leg_Palazzo.webp', patterns: ['SOLID WIDE LEG', 'SOLIDWIDELEG', 'PALAZZO', 'PLAZO'] },

  // --- STANDALONE CATEGORIES (No Drill-Down, Parent is null) ---
  { parent: null, title: 'Metallic Pants', img: '/images/updated/metallic_straight_pant.webp', patterns: ['METALLIC', 'METALIC'] },
  { parent: null, title: 'T-shirts', img: '/images/updated/active_t-shirt.webp', patterns: ['T-SHIRT', 'T SHIRT', 'TSHIRT'] }
]

// 2. UPDATED: Returns parent and child data
const deriveCategoryData = (p) => {
  const name = String(p?.product_name || '').trim()
  if (!name) return null
  const up = name.replace(/\s+/g, ' ').trim().toUpperCase()

  // KILL SWITCH: Instantly hide these unwanted database items
  const IGNORE_WORDS = ['SPORTS VEST', 'SPORTS BRA', 'SHAWL', 'DENIM', 'JEAN', 'JEGGING', 'SHRUG', 'HOODIE', 'SWEATSHIRT', 'DRESS', 'TOP']
  if (IGNORE_WORDS.some(w => up.includes(w))) {
    return null; // This tells the UI to completely ignore the product
  }

  for (const g of CATEGORY_GROUPS) {
    for (const pat of g.patterns) {
      const t = String(pat || '').trim().toUpperCase()
      if (t && up.includes(t)) return { parent: g.parent, title: g.title, img: g.img }
    }
  }
  
  // If it STILL doesn't match our 6 strict categories, hide it!
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
      
      // NEW LINE: If deriveCategoryData returned null, skip this product entirely!
      if (!catData) continue;

      const key = normalizeKey(catData.title)
      if (!key) continue
      
      // ... (Keep the rest of this function exactly as it was)
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


// 5. UPDATED: Click handler logic for direct-to-product-page routing
  const openCategory = (catObj) => {
    if (catObj.isParentNode) {
      setSelectedParent(catObj.title)
    } else {
      // 1. Find every single product in this subcategory
      const matchingVariants = filteredProducts.filter((p) => {
        const pCat = deriveCategoryData(p)
        
        // THE BUG FIX: If the product was hidden (null), skip it safely!
        if (!pCat) return false; 
        
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
    setSelectedParent(null) // Reset drill-down
    navigate('/category-display')
  }

  const headerTitle = selectedBrand ? `${selectedBrand} Categories` : 'Women Categories'
  const subtitle = selectedBrand ? 'Choose a category for this brand' : 'Pick a category to see matching products'

  return (
    <div className="category-page">
      <Navbar />


      <div className="category-top-spacer" />

   
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