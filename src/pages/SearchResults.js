import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import Footer from './Footer'
import './SearchResults.css'
import { useWishlist } from '../WishlistContext'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

const BRANCH_ID_RAW =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BRANCH_ID) ||
  ''
const BRANCH_ID = BRANCH_ID_RAW ? String(BRANCH_ID_RAW).trim() : ''

const DEFAULT_IMG_BY_GENDER = {
  WOMEN: '/images/defaults/attach-women.png',
  MEN: '/images/defaults/attach-men.png',
  KIDS: '/images/defaults/attach-kids.png',
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

const toInt = (v) => {
  const n = Number(v)
  return Number.isInteger(n) && n > 0 ? n : null
}

const detectGender = (q) => {
  const s = String(q || '').toLowerCase()
  if (/\b(women|woman|ladies|female|womens)\b/.test(s))
    return { gender: 'WOMEN', cleaned: s.replace(/\b(women|woman|ladies|female|womens)\b/gi, '').trim() }
  if (/\b(men|man|male|gents|mens)\b/.test(s))
    return { gender: 'MEN', cleaned: s.replace(/\b(men|man|male|gents|mens)\b/gi, '').trim() }
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
    normalizeText(product.category_name),
    normalizeText(product.category_slug),
    normalizeText(product.pattern_code),
    normalizeText(product.fit_type),
    normalizeText(product.fit),
    normalizeText(product.gender),
    normalizeText(product.color)
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

const groupProductsByProductId = (products) => {
  const byPid = new Map()

  for (const p of products || []) {
    if (!p) continue
    const pid = toInt(p.product_id)
    if (!pid) continue
    const normalizeKey = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
    const base = [normalizeKey(p.brand || p.brand_name), normalizeKey(p.product_name || p.name), normalizeKey(p.category_name || p.category)]
    const design = normalizeKey(p.design_code || p.pattern_code || p.style_code || p.mark_code || p.model_code)
    const colour = normalizeKey(p.color || p.colour) || 'default'
    const familyKey = `${base.join('|')}|${design ? `design:${design}` : `legacy:${colour}`}`

    if (!byPid.has(familyKey)) {
      byPid.set(familyKey, {
        key: familyKey,
        product_id_locked: pid,
        brand: String(p.brand || '').trim(),
        product_name: String(p.product_name || '').trim(),
        gender: String(p.gender || '').trim(),
        color: String(p.color || p.colour || '').trim(),
        category: String(p.category_name || p.category || '').trim(),
        category_name: String(p.category_name || p.category || '').trim(),
        category_slug: String(p.category_slug || '').trim(),
        pattern_code: String(p.pattern_code || '').trim(),
        fit_type: String(p.fit_type || p.fit || '').trim(),
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
    byPid.get(familyKey).variants.push(p)
  }

  const out = []
  for (const g of byPid.values()) {
    const eans = uniq(g.variants.map((v) => v.ean_code))
    const imgs = uniq([...g.variants.map((v) => v.image_url), ...eans.map((ean) => cloudinaryUrlByEan(ean))])

    const hasStockInfo = g.variants.some((v) => v.in_stock !== undefined || v.available_qty !== undefined)
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
      id: g.product_id_locked,
      product_id: g.product_id_locked,
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
  const [selectedGender, setSelectedGender] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [sortOrder, setSortOrder] = useState('relevance')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  const query = useMemo(() => new URLSearchParams(location.search).get('q') || '', [location.search])
  const parsed = useMemo(() => parseSearchQuery(query), [query])
  const { gender, queryText, priceMin, priceMax } = parsed
  const filterSummary = useMemo(() => buildFilterSummary(parsed), [parsed])

  const userType = (localStorage.getItem('userType') || sessionStorage.getItem('userType') || 'B2C').toUpperCase()
  const userId =
    (typeof window !== 'undefined' && (sessionStorage.getItem('userId') || localStorage.getItem('userId'))) || null

  const getPriceFields = useCallback(
    (item) => {
      const p = item.price_fields || item || {}
      const num = (v) => {
        const n = Number(v)
        return Number.isFinite(n) && n > 0 ? n : 0
      }
      if (userType === 'B2B') {
        const offerCandidates = [p.final_price_b2b, p.sale_price, p.mrp, p.original_price_b2b, p.original_price_b2c]
        const mrpCandidates = [p.mrp, p.original_price_b2b, p.original_price_b2c, p.final_price_b2b, p.sale_price]
        const offer = offerCandidates.map(num).find((v) => v > 0) || 0
        const mrp = mrpCandidates.map(num).find((v) => v > 0) || offer
        return { offer, mrp }
      }
      const offerCandidates = [p.final_price_b2c, p.sale_price, p.mrp, p.original_price_b2c]
      const mrpCandidates = [p.mrp, p.original_price_b2c, p.final_price_b2c, p.sale_price]
      const offer = offerCandidates.map(num).find((v) => v > 0) || 0
      const mrp = mrpCandidates.map(num).find((v) => v > 0) || offer
      return { offer, mrp }
    },
    [userType]
  )

  const results = useMemo(() => {
    const filtered = baseResults.filter(item =>
      (!selectedGender || item.gender === selectedGender) &&
      (!selectedCategory || item.category_name === selectedCategory) &&
      (!selectedBrand || item.brand === selectedBrand)
    )
    if (sortOrder === 'low') filtered.sort((a, b) => getPriceFields(a).offer - getPriceFields(b).offer)
    if (sortOrder === 'high') filtered.sort((a, b) => getPriceFields(b).offer - getPriceFields(a).offer)
    return filtered
  }, [baseResults, selectedGender, selectedCategory, selectedBrand, sortOrder, getPriceFields])

  const filterOptions = useMemo(() => ({
    genders: uniq(baseResults.map(item => item.gender)).sort(),
    categories: uniq(baseResults.map(item => item.category_name)).sort(),
    brands: uniq(baseResults.map(item => item.brand)).sort()
  }), [baseResults])

  useEffect(() => {
    setSelectedGender('')
    setSelectedCategory('')
    setSelectedBrand('')
    setSortOrder('relevance')
  }, [query])

  const offerPrice = useCallback((item) => getPriceFields(item).offer, [getPriceFields])
  const originalPrice = useCallback((item) => getPriceFields(item).mrp, [getPriceFields])

  const discountPctValue = useCallback(
    (item) => {
      const { offer, mrp } = getPriceFields(item)
      if (!mrp || mrp <= 0) return 0
      if (!offer || offer <= 0 || offer >= mrp) return 0
      const pct = ((mrp - offer) / mrp) * 100
      return Math.max(0, Math.round(pct))
    },
    [getPriceFields]
  )

  const getImg = useCallback((group) => {
    const img = group.images?.[0]
    if (img) return img
    const g = String(group.gender || group.rep?.gender || '').toUpperCase()
    return DEFAULT_IMG_BY_GENDER[g] || DEFAULT_IMG_BY_GENDER._
  }, [])

  const applyQueryFilters = useCallback(
    (products, currentQueryText, min, max) => {
      const tokens = buildTokens(currentQueryText)
      return (products || []).filter((p) => {
        const price = offerPrice(p)
        if (min != null && price < min) return false
        if (max != null && price > max) return false
        if (!textMatchesProduct(tokens, p)) return false
        return true
      })
    },
    [offerPrice]
  )

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const baseSearchTerm = queryText || query
        const params = new URLSearchParams()
        params.set('q', baseSearchTerm || '')
        if (gender) params.set('gender', gender)
        if (BRANCH_ID) params.set('branch_id', BRANCH_ID)

        const url = `${API_BASE}/api/products/search?${params.toString()}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Unable to load products')
        const data = await res.json()
        const arr = Array.isArray(data) ? data : data?.products || []

        if (!cancelled) {
          const refinedRows = applyQueryFilters(arr, queryText, priceMin, priceMax)
          const grouped = groupProductsByProductId(refinedRows)
          setBaseResults(grouped)

        }
      } catch {
        if (!cancelled) {
          setBaseResults([])
          setError('Unable to load products. Please try again.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [applyQueryFilters, gender, priceMax, priceMin, query, queryText])

  const suggestAbortRef = useRef(null)
  const suggestTimerRef = useRef(null)

  useEffect(() => {
    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current)
    if (suggestAbortRef.current) suggestAbortRef.current.abort()

    const v = searchInput.trim()
    if (v.length < 2) {
      setSuggestions([])
      return
    }

    suggestTimerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      suggestAbortRef.current = controller
      try {
        const params = new URLSearchParams()
        params.set('q', v)
        if (gender) params.set('gender', gender)
        if (BRANCH_ID) params.set('branch_id', BRANCH_ID)
        const resp = await fetch(`${API_BASE}/api/products/suggest?${params.toString()}`, { signal: controller.signal })
        const data = await resp.json()
        setSuggestions(Array.isArray(data) ? data : [])
      } catch {
        setSuggestions([])
      }
    }, 180)

    return () => {
      if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current)
      if (suggestAbortRef.current) suggestAbortRef.current.abort()
    }
  }, [searchInput, gender])

  const productIdForGroup = useCallback((group) => toInt(group?.product_id_locked) || toInt(group?.product_id) || null, [])

  const handleProductClick = useCallback(
    (group) => {
      const product = group.rep || group
      const variantId = toInt(product?.variant_id) || toInt(product?.id)
      if (variantId) navigate(`/product/${variantId}`)
    },
    [navigate]
  )

  const handleWishlist = useCallback(
    async (e, group) => {
      e.preventDefault()
      e.stopPropagation()

      const pid = productIdForGroup(group)
      if (!userId || !pid) return

      try {
        const payload = { user_id: userId, product_id: pid }
        if (BRANCH_ID) payload.branch_id = BRANCH_ID
        const resp = await fetch(`${API_BASE}/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (resp.ok) {
          const product = group.rep || group
          addToWishlist({ ...product, product_id: pid, id: pid })
        }
      } catch {}
    },
    [addToWishlist, productIdForGroup, userId]
  )

  const isInWishlist = useCallback(
    (group) => {
      const pid = productIdForGroup(group)
      if (!pid) return false
      return wishlistItems.some((w) => String(w.product_id ?? w.id) === String(pid))
    },
    [productIdForGroup, wishlistItems]
  )

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault()
      const value = searchInput.trim()
      const params = new URLSearchParams(location.search)
      if (value) params.set('q', value)
      else params.delete('q')
      navigate(`${location.pathname}?${params.toString()}`)
      setShowSuggestions(false)
    },
    [location.pathname, location.search, navigate, searchInput]
  )

  const handleSuggestionClick = useCallback(
    (value) => {
      setSearchInput(value)
      const params = new URLSearchParams(location.search)
      params.set('q', value)
      navigate(`${location.pathname}?${params.toString()}`)
      setShowSuggestions(false)
    },
    [location.pathname, location.search, navigate]
  )

  return (
    <div className="asr-page">
      <main className="asr-main">
        <div className="asr-search-wrap">
          <form className="asr-search-bar" onSubmit={handleSearchSubmit}>
            <div className="asr-search-row">
              <input
                type="search"
                aria-label="Search products"
                autoComplete="off"
                onBlur={() => setShowSuggestions(false)}
                onKeyDown={event => { if (event.key === "Escape") setShowSuggestions(false) }}
                className="asr-search-input"
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

              <button type="submit" className="asr-search-btn">
                Search
              </button>

              {showSuggestions && suggestions.length > 0 && (
                <div className="asr-suggestions">
                  {suggestions.map((s) => (
                    <div
                      key={s}
                      className="asr-suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSuggestionClick(s)
                      }}
                    >
                      <span className="asr-suggestion-dot" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>


          </form>
        </div>

        <div className="asr-filters">
          <label><span>Gender</span><select value={selectedGender} onChange={event => setSelectedGender(event.target.value)}><option value="">All genders</option>{filterOptions.genders.map(value => <option key={value} value={value}>{GENDER_LABELS[value] || value}</option>)}</select></label>
          <label><span>Category</span><select value={selectedCategory} onChange={event => setSelectedCategory(event.target.value)}><option value="">All categories</option>{filterOptions.categories.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <label><span>Brand</span><select value={selectedBrand} onChange={event => setSelectedBrand(event.target.value)}><option value="">All brands</option>{filterOptions.brands.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <label><span>Sort by</span><select value={sortOrder} onChange={event => setSortOrder(event.target.value)}><option value="relevance">Relevance</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option></select></label>
          <button type="button" className="asr-clear" onClick={() => { setSelectedGender(''); setSelectedCategory(''); setSelectedBrand(''); setSortOrder('relevance') }}>Clear filters</button>
        </div>

        {error ? <div className="asr-status-wrap" role="alert"><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div> : loading ? (
          <div className="asr-status-wrap">
            <p className="asr-status">Loading...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="asr-status-wrap">
            <p className="asr-status">No products found.</p>
          </div>
        ) : (
          <section className="asr-grid-wrap">
            <div className="asr-header">
              <div>
                <h2 className="asr-title">
                  Results for <span className="asr-highlight">{query}</span>
                </h2>
                {filterSummary ? <p className="asr-subtitle">{filterSummary}</p> : null}
              </div>
              <span className="asr-count">{results.length} items</span>
            </div>

            <div className="asr-grid">
              {results.map((group) => {
                const discount = discountPctValue(group)
                const sizeCount = uniq((group.variants || []).map(item => item.size)).length
                const hasVariants = sizeCount > 1
                const isOutOfStock = group.is_out_of_stock

                return (
                  <article
                    key={group.key}
                    className="asr-card"

                  >
                    <div className="asr-image">
                      <button type="button" className="asr-open" onClick={() => handleProductClick(group)} aria-label={`View ${group.product_name}`} />
                      {discount > 0 && (
                        <div className="asr-discount">
                          <span>{discount}% OFF</span>
                        </div>
                      )}

                      {hasVariants && <div className="asr-sizes">{sizeCount} sizes</div>}

                      <img
                        src={getImg(group)}
                        alt={group.product_name}
                        className="asr-photo"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const g = String(group.gender || group.rep?.gender || '').toUpperCase()
                          const fallback = DEFAULT_IMG_BY_GENDER[g] || DEFAULT_IMG_BY_GENDER._
                          if (!e.currentTarget.dataset.fallback) { e.currentTarget.dataset.fallback = 'true'; e.currentTarget.src = fallback }
                        }}
                      />

                      {isOutOfStock && (
                        <div className="asr-stock-overlay">
                          <span>Out of Stock</span>
                        </div>
                      )}

                      <button type="button" className="asr-wishlist" onClick={(e) => handleWishlist(e, group)} aria-label={`Save ${group.product_name} to wishlist`}>
                        {isInWishlist(group) ? (
                          <FaHeart  />
                        ) : (
                          <FaRegHeart  />
                        )}
                      </button>

                      {group.gender && <div className="asr-pill">{GENDER_LABELS[group.gender] || group.gender}</div>}
                    </div>

                    <div className="asr-card-body">
                      <div className="asr-brand-row">
                        <h4 className="asr-brand">{group.brand}</h4>
                        
                      </div>

                      <h5 className="asr-name"><button type="button" onClick={() => handleProductClick(group)}>{group.product_name}</button></h5>

                      <div className="asr-prices">
                        <span className="asr-price">₹{offerPrice(group).toFixed(2)}</span>
                        {originalPrice(group) > offerPrice(group) && <del className="asr-original">₹{originalPrice(group).toFixed(2)}</del>}
                      </div>

                      <div className="asr-meta">
                        <span className="asr-price-type">{userType === 'B2B' ? 'Best B2B margin' : 'Inclusive of all taxes'}</span>
                        {discount > 0 && <span className="asr-saving">You save {discount}%</span>}
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
