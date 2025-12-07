import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import Navbar from './Navbar'
import Footer from './Footer'
import FilterSidebar from './FilterSidebar'
import './SearchResults.css'
import './WomenDisplayPage.css'
import { useWishlist } from '../WishlistContext'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

const BRANCH_ID_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BRANCH_ID) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BRANCH_ID) ||
  ''
const BRANCH_ID = BRANCH_ID_RAW ? String(BRANCH_ID_RAW).trim() : ''

const DEFAULT_IMG_BY_GENDER = {
  WOMEN: '/images/women/women20.jpeg',
  MEN: '/images/men/mens13.jpeg',
  KIDS: '/images/kids/kids-girls-frock.jpg',
  _: '/images/placeholder.jpg'
}

const GENDER_LABELS = {
  WOMEN: 'Women',
  MEN: 'Men',
  KIDS: 'Kids'
}

const STOPWORDS = new Set([
  'for',
  'and',
  'with',
  'in',
  'the',
  'a',
  'an',
  'of',
  'to',
  'on',
  'from',
  'at',
  'by',
  'rs',
  'rupees',
  'below',
  'under',
  'upto',
  'between',
  'above',
  'over',
  'less',
  'more',
  'than',
  'price',
  'underwear',
  'underware'
])

const detectGender = (q) => {
  const s = String(q || '').toLowerCase()
  if (/\b(women|woman|ladies|female)\b/.test(s))
    return { gender: 'WOMEN', cleaned: s.replace(/\b(women|woman|ladies|female)\b/gi, '').trim() }
  if (/\b(men|man|male|gents)\b/.test(s))
    return { gender: 'MEN', cleaned: s.replace(/\b(men|man|male|gents)\b/gi, '').trim() }
  if (/\b(kids|kid|children|child|boys|girls)\b/.test(s))
    return { gender: 'KIDS', cleaned: s.replace(/\b(kids|kid|children|child|boys|girls)\b/gi, '').trim() }
  return { gender: '', cleaned: s.trim() }
}

const parsePriceRangeFromQuery = (raw) => {
  const original = String(raw || '')
  const s = original.toLowerCase()
  const hyphenRange = s.match(/(\d+)\s*-\s*(\d+)/)
  let priceMin = null
  let priceMax = null
  if (hyphenRange) {
    const n1 = parseInt(hyphenRange[1], 10)
    const n2 = parseInt(hyphenRange[2], 10)
    if (!Number.isNaN(n1) && !Number.isNaN(n2)) {
      priceMin = Math.min(n1, n2)
      priceMax = Math.max(n1, n2)
    }
  } else {
    const numbers = s.match(/\d+/g)
    if (numbers && numbers.length) {
      const first = parseInt(numbers[0], 10)
      const second = numbers[1] ? parseInt(numbers[1], 10) : null
      const hasUnder = /(under|below|upto|up to|less than|<|<=)/.test(s)
      const hasAbove = /(above|over|more than|>|>=)/.test(s)
      const hasBetween = /(between|from)/.test(s) && /(to|and)/.test(s)
      if (hasBetween && second != null && !Number.isNaN(second)) {
        priceMin = Math.min(first, second)
        priceMax = Math.max(first, second)
      } else if (hasUnder) {
        priceMax = first
      } else if (hasAbove) {
        priceMin = first
      }
    }
  }
  let cleaned = original.replace(
    /\b(under|below|between|upto|up to|less than|greater than|above|over|more than|price|rs|rs\.|rupees)\b/gi,
    ' '
  )
  cleaned = cleaned.replace(/\d+/g, ' ')
  cleaned = cleaned.replace(/₹/g, ' ')
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  return { priceMin, priceMax, cleanedQuery: cleaned }
}

const normalizeText = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/₹/g, ' ')
    .replace(/rs\.?/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const buildTokens = (text) => {
  const norm = normalizeText(text)
  if (!norm) return []
  return norm.split(' ').filter((t) => t && !STOPWORDS.has(t))
}

const tokenMatchesField = (token, field) => {
  if (!token || !field) return false
  const base = token.toLowerCase()
  const f = field.toLowerCase()
  const singular = base.endsWith('s') ? base.slice(0, -1) : base
  if (f.includes(base)) return true
  if (singular && f.includes(singular)) return true
  return false
}

const textMatchesProduct = (tokens, product) => {
  if (!tokens.length) return true
  const fields = [
    normalizeText(product.product_name),
    normalizeText(product.brand),
    normalizeText(product.category),
    normalizeText(product.category_slug),
    normalizeText(product.gender)
  ]
  return tokens.every((t) => fields.some((f) => f && tokenMatchesField(t, f)))
}

const parseSearchQuery = (rawQuery) => {
  const { gender, cleaned } = detectGender(rawQuery)
  const { priceMin, priceMax, cleanedQuery } = parsePriceRangeFromQuery(cleaned)
  const queryText = cleanedQuery || cleaned || String(rawQuery || '').toLowerCase().trim()
  return { gender, queryText, priceMin, priceMax }
}

const buildFilterSummary = ({ gender, priceMin, priceMax }) => {
  const parts = []
  if (gender && GENDER_LABELS[gender]) parts.push(GENDER_LABELS[gender])
  if (priceMin != null && priceMax != null) parts.push(`₹${priceMin} - ₹${priceMax}`)
  else if (priceMin != null) parts.push(`Above ₹${priceMin}`)
  else if (priceMax != null) parts.push(`Under ₹${priceMax}`)
  if (!parts.length) return ''
  return parts.join(' • ')
}

const normalizeSuggestionToken = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim()

const levenshteinDistance = (a, b) => {
  const s = normalizeSuggestionToken(a)
  const t = normalizeSuggestionToken(b)
  if (!s.length) return t.length
  if (!t.length) return s.length
  const dp = Array.from({ length: s.length + 1 }, () => new Array(t.length + 1).fill(0))
  for (let i = 0; i <= s.length; i += 1) dp[i][0] = i
  for (let j = 0; j <= t.length; j += 1) dp[0][j] = j
  for (let i = 1; i <= s.length; i += 1) {
    for (let j = 1; j <= t.length; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1
      const del = dp[i - 1][j] + 1
      const ins = dp[i][j - 1] + 1
      const sub = dp[i - 1][j - 1] + cost
      dp[i][j] = Math.min(del, ins, sub)
    }
  }
  return dp[s.length][t.length]
}

const buildSuggestionTokens = (products) => {
  const map = new Map()
  products.forEach((p) => {
    const name = normalizeText(p.product_name)
    if (!name) return
    const parts = name.split(' ')
    parts.forEach((w) => {
      const token = w.trim()
      if (token.length < 3) return
      if (!map.has(token)) map.set(token, true)
    })
  })
  return Array.from(map.keys())
}

const toTitleCase = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const getSuggestions = (input, tokens) => {
  const q = normalizeSuggestionToken(input)
  if (!q || q.length < 2) return []
  const scored = []
  tokens.forEach((token) => {
    const norm = normalizeSuggestionToken(token)
    if (!norm) return
    let score = 999
    if (norm.startsWith(q)) {
      score = 0
    } else if (norm.includes(q)) {
      score = 1
    } else {
      const d = levenshteinDistance(norm, q)
      if (d <= 2) score = 2 + d
      else return
    }
    scored.push({ token, score })
  })
  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score
    return a.token.length - b.token.length
  })
  const unique = []
  const used = new Set()
  for (let i = 0; i < scored.length; i += 1) {
    const key = scored[i].token.toLowerCase()
    if (!used.has(key)) {
      used.add(key)
      unique.push(toTitleCase(scored[i].token))
      if (unique.length >= 8) break
    }
  }
  return unique
}

const cloudinaryUrlByEan = (ean) => {
  if (!ean) return ''
  return `https://res.cloudinary.com/deymt9uyh/image/upload/f_auto,q_auto/products/${ean}`
}

const uniq = (arr) => {
  const seen = new Set()
  const out = []
  for (const x of arr) {
    const k = String(x || '')
    if (!seen.has(k) && k) {
      seen.add(k)
      out.push(k)
    }
  }
  return out
}

const groupProductsByColor = (products) => {
  const byKey = new Map()
  for (const p of products || []) {
    if (!p) continue
    const baseKey = [
      p.product_name || '',
      p.brand || '',
      p.color || '',
      p.gender || ''
    ].join('||')
    const key =
      baseKey.trim() ||
      `__fallback__:${p.ean_code || p.product_id || p.id || Math.random()}`
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        color: p.color,
        brand: p.brand,
        product_name: p.product_name,
        gender: p.gender,
        price_fields: {
          original_price_b2c: p.original_price_b2c,
          final_price_b2c: p.final_price_b2c,
          original_price_b2b: p.original_price_b2b,
          final_price_b2b: p.final_price_b2b,
          mrp: p.mrp,
          sale_price: p.sale_price
        },
        rep: p,
        variants: []
      })
    }
    const g = byKey.get(key)
    g.variants.push(p)
  }

  const out = []
  for (const g of byKey.values()) {
    const eans = uniq(g.variants.map((v) => v.ean_code))
    const imgs = uniq([
      ...g.variants.map((v) => v.image_url),
      ...eans.map((ean) => cloudinaryUrlByEan(ean))
    ])

    const hasStockInfo = g.variants.some(
      (v) => v.in_stock !== undefined || v.available_qty !== undefined
    )

    const anyVariantInStock = g.variants.some((v) => {
      const qty = Number(v.available_qty ?? 0)
      if (v.in_stock === true) return true
      if (v.in_stock === false) return qty > 0
      return qty > 0
    })

    out.push({
      ...g,
      images: imgs,
      ean_code: eans[0] || '',
      id: g.rep.id,
      product_id: g.rep.product_id,
      brand: g.brand || g.rep.brand,
      product_name: g.product_name || g.rep.product_name,
      is_out_of_stock: hasStockInfo ? !anyVariantInStock : false
    })
  }
  return out
}

const SearchResults = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { wishlistItems, addToWishlist } = useWishlist()
  const [baseResults, setBaseResults] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const query = new URLSearchParams(location.search).get('q') || ''
  const parsed = useMemo(() => parseSearchQuery(query), [query])
  const { gender, queryText, priceMin, priceMax } = parsed
  const filterSummary = useMemo(() => buildFilterSummary(parsed), [parsed])

  const userType = (
    localStorage.getItem('userType') ||
    sessionStorage.getItem('userType') ||
    'B2C'
  ).toUpperCase()
  const userId =
    (typeof window !== 'undefined' && (sessionStorage.getItem('userId') || localStorage.getItem('userId'))) ||
    null

  const getPriceFields = (item) => {
    const p = item.price_fields || item || {}
    const num = (v) => {
      const n = Number(v)
      return Number.isFinite(n) && n > 0 ? n : 0
    }
    if (userType === 'B2B') {
      const offerCandidates = [
        p.final_price_b2b,
        p.sale_price,
        p.mrp,
        p.original_price_b2b,
        p.original_price_b2c
      ]
      const mrpCandidates = [
        p.mrp,
        p.original_price_b2b,
        p.original_price_b2c,
        p.final_price_b2b,
        p.sale_price
      ]
      const offer = offerCandidates.map(num).find((v) => v > 0) || 0
      const mrp = mrpCandidates.map(num).find((v) => v > 0) || offer
      return { offer, mrp }
    }
    const offerCandidates = [
      p.final_price_b2c,
      p.sale_price,
      p.mrp,
      p.original_price_b2c
    ]
    const mrpCandidates = [
      p.mrp,
      p.original_price_b2c,
      p.final_price_b2c,
      p.sale_price
    ]
    const offer = offerCandidates.map(num).find((v) => v > 0) || 0
    const mrp = mrpCandidates.map(num).find((v) => v > 0) || offer
    return { offer, mrp }
  }

  const offerPrice = (item) => getPriceFields(item).offer
  const originalPrice = (item) => getPriceFields(item).mrp

  const discountPctValue = (item) => {
    const { offer, mrp } = getPriceFields(item)
    if (!mrp || mrp <= 0) return 0
    if (!offer || offer <= 0 || offer >= mrp) return 0
    const pct = ((mrp - offer) / mrp) * 100
    return Math.max(0, Math.round(pct))
  }

  const getImg = (group) => {
    const img = group.images?.[0]
    if (img) return img
    const g = group.gender || group.rep?.gender
    return DEFAULT_IMG_BY_GENDER[g] || DEFAULT_IMG_BY_GENDER._
  }

  const applyQueryFilters = (products, currentQueryText, min, max) => {
    const tokens = buildTokens(currentQueryText)
    return products.filter((p) => {
      const price = offerPrice(p)
      if (min != null && price < min) return false
      if (max != null && price > max) return false
      if (!textMatchesProduct(tokens, p)) return false
      return true
    })
  }

  const suggestionTokens = useMemo(() => buildSuggestionTokens(baseResults), [baseResults])
  const suggestions = useMemo(
    () => getSuggestions(searchInput, suggestionTokens),
    [searchInput, suggestionTokens]
  )

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const baseSearchTerm = queryText || query
        const url = gender
          ? `${API_BASE}/api/products?gender=${encodeURIComponent(gender)}${
              baseSearchTerm ? `&q=${encodeURIComponent(baseSearchTerm)}` : ''
            }`
          : `${API_BASE}/api/products/search?q=${encodeURIComponent(baseSearchTerm)}`
        const res = await fetch(url)
        const data = await res.json()
        const arr = Array.isArray(data) ? data : []
        if (!cancelled) {
          const refinedRows = applyQueryFilters(arr, queryText, priceMin, priceMax)
          const grouped = groupProductsByColor(refinedRows)
          setBaseResults(grouped)
          setResults(grouped)
        }
      } catch {
        if (!cancelled) {
          setBaseResults([])
          setResults([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [gender, query, queryText, priceMin, priceMax])

  const handleProductClick = (group) => {
    const product = group.rep || group
    if (product) {
      sessionStorage.setItem('selectedProduct', JSON.stringify(product))
      navigate('/checkout')
    }
  }

  const handleWishlist = async (e, group) => {
    e.stopPropagation()
    const product = group.rep || group
    if (!product) return
    const productId = product.product_id ?? product.id
    if (!userId || !productId) return
    try {
      const payload = {
        user_id: userId,
        product_id: productId
      }
      if (BRANCH_ID) {
        payload.branch_id = BRANCH_ID
      }
      const resp = await fetch(`${API_BASE}/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (resp.ok) {
        addToWishlist({ ...product, product_id: productId })
        navigate('/wishlist')
      }
    } catch {}
  }

  const isInWishlist = (group) => {
    const product = group.rep || group
    if (!product) return false
    const productId = product.product_id ?? product.id
    if (!productId) return false
    return wishlistItems.some(
      (w) => String(w.product_id ?? w.id) === String(productId)
    )
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const value = searchInput.trim()
    const params = new URLSearchParams(location.search)
    if (value) params.set('q', value)
    else params.delete('q')
    navigate(`${location.pathname}?${params.toString()}`)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (value) => {
    setSearchInput(value)
    const params = new URLSearchParams(location.search)
    params.set('q', value)
    navigate(`${location.pathname}?${params.toString()}`)
    setShowSuggestions(false)
  }

  return (
    <div className="sr-page">
      <Navbar />
      <div className="sr-topbar">
        <div className="sr-topbar-inner">
          <FilterSidebar
            source={baseResults}
            onFilterChange={(filtered) => {
              setResults(filtered)
            }}
          />
        </div>
      </div>
      <main className="sr-main">
        <div className="sr-search-wrap">
          <form className="sr-search-bar" onSubmit={handleSearchSubmit}>
            <div className="sr-search-row">
              <input
                type="text"
                className="sr-search-input"
                placeholder="Search for products"
                value={searchInput}
                onChange={(e) => {
                  const val = e.target.value
                  setSearchInput(val)
                  if (val.trim().length > 1) setShowSuggestions(true)
                  else setShowSuggestions(false)
                }}
                onFocus={() => {
                  if (searchInput.trim().length > 1) setShowSuggestions(true)
                }}
              />
              <button type="submit" className="sr-search-btn">
                Search
              </button>
              {showSuggestions && suggestions.length > 0 && (
                <div className="sr-suggestions">
                  {suggestions.map((s) => (
                    <div
                      key={s}
                      className="sr-suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSuggestionClick(s)
                      }}
                    >
                      <span className="sr-suggestion-dot" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="sr-search-note">Type a few letters to see matching product names.</p>
          </form>
        </div>
        {loading ? (
          <div className="sr-status-wrap">
            <p className="sr-status">Loading...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="sr-status-wrap">
            <p className="sr-status">No products found.</p>
          </div>
        ) : (
          <section className="sr-grid-wrap">
            <div className="sr-header">
              <div>
                <h2 className="sr-title">
                  Results for <span className="sr-highlight">{query}</span>
                </h2>
                {filterSummary ? <p className="sr-subtitle">{filterSummary}</p> : null}
              </div>
              <span className="sr-count">{results.length} items</span>
            </div>
            <div className="womens-section4-grid">
              {results.map((group) => {
                const discount = discountPctValue(group)
                const hasVariants = group.variants && group.variants.length > 1
                const isOutOfStock = group.is_out_of_stock
                return (
                  <article
                    key={group.key}
                    className={`womens-section4-card${isOutOfStock ? ' out-of-stock' : ''}`}
                    onClick={() => handleProductClick(group)}
                  >
                    <div className="womens-section4-img">
                      {discount > 0 && (
                        <div className="discount-ribbon">
                          <span>{discount}% OFF</span>
                        </div>
                      )}
                      {hasVariants && (
                        <div className="variant-pill">
                          {group.variants.length} sizes
                        </div>
                      )}
                      <img
                        src={getImg(group)}
                        alt={group.product_name}
                        className="fade-image"
                        onError={(e) => {
                          const g = group.gender || group.rep?.gender
                          const fallback =
                            DEFAULT_IMG_BY_GENDER[g] || DEFAULT_IMG_BY_GENDER._
                          if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback
                        }}
                      />
                      {isOutOfStock && (
                        <div className="out-of-stock-overlay">
                          <span>Out of Stock</span>
                        </div>
                      )}
                      <div
                        className="love-icon"
                        onClick={(e) => handleWishlist(e, group)}
                      >
                        {isInWishlist(group) ? (
                          <FaHeart style={{ color: 'gold', fontSize: '20px' }} />
                        ) : (
                          <FaRegHeart style={{ color: 'gold', fontSize: '20px' }} />
                        )}
                      </div>
                      {group.gender && (
                        <div className="sr-pill">
                          {GENDER_LABELS[group.gender] || group.gender}
                        </div>
                      )}
                    </div>
                    <div className="womens-section4-body">
                      <div className="brand-row">
                        <h4 className="brand-name">{group.brand}</h4>
                        <span className="brand-chip">New in</span>
                      </div>
                      <h5 className="product-name">{group.product_name}</h5>
                      <div className="card-price-row">
                        <span className="card-offer-price">
                          ₹{offerPrice(group).toFixed(2)}
                        </span>
                        <span className="card-original-price">
                          ₹{originalPrice(group).toFixed(2)}
                        </span>
                      </div>
                      <div className="womens-section4-meta">
                        <span className="price-type">
                          {userType === 'B2B'
                            ? 'Best B2B margin'
                            : 'Inclusive of all taxes'}
                        </span>
                        {discount > 0 && (
                          <span className="saving-text">You save {discount}%</span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default SearchResults
