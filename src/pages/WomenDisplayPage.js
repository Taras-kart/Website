import React, { useMemo, useRef, useState } from 'react'
import './WomenDisplayPage.css'
import { FaHeart, FaRegHeart, FaEye } from 'react-icons/fa'
import FullDetailsPopup from './FullDetailsPopup'
import { Link } from 'react-router-dom'

const CLOUD_NAME = 'deymt9uyh'

const DEFAULT_IMG_BY_GENDER = {
  WOMEN: '/images/women/women20.jpeg',
  MEN: '/images/men/mens13.jpeg',
  KIDS: '/images/kids/kids-girls-frock.jpg',
  _: '/images/women/women20.jpeg'
}

function cloudinaryUrlByEan(ean) {
  if (!ean) return ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/products/${ean}`
}

function uniqByKey(arr, keyFn) {
  const seen = new Set()
  const out = []
  for (const x of arr || []) {
    const k = keyFn(x)
    if (!k) continue
    if (seen.has(k)) continue
    seen.add(k)
    out.push(x)
  }
  return out
}

function isRealRemoteImage(src) {
  if (!src) return false
  const s = String(src)
  return s.startsWith('http://') || s.startsWith('https://')
}

function uniqNonEmptyStrings(list) {
  const seen = new Set()
  const out = []
  for (const v of list || []) {
    const s = String(v || '').trim()
    if (!s) continue
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
  }
  return out
}

function groupProductsByColor(products) {
  const byKey = new Map()
  for (const p of products || []) {
    if (!p) continue
    const baseKey = [p.product_name || '', p.brand || '', p.color || '', p.gender || ''].join('||')
    const key = baseKey.trim() || `__fallback__:${p.ean_code || p.product_id || p.id || Math.random()}`
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
    byKey.get(key).variants.push(p)
  }

  const out = []
  for (const g of byKey.values()) {
    const hasStockInfo = g.variants.some((v) => v.in_stock !== undefined || v.available_qty !== undefined || v.on_hand !== undefined)

    const allVariantsOutOfStock = g.variants.every((v) => {
      const qty = Number(v.available_qty !== undefined ? v.available_qty : v.on_hand !== undefined ? v.on_hand : 0)
      if (v.is_out_of_stock === true) return true
      if (v.is_out_of_stock === false) return false
      if (v.in_stock === true) return false
      if (v.in_stock === false) return qty <= 0
      return qty <= 0
    })

    const isOutOfStock = hasStockInfo ? allVariantsOutOfStock : false

    const imgsRaw = g.variants.map((v) => {
      const ean = String(v.ean_code || '').trim()
      const src = (v.image_url || (ean ? cloudinaryUrlByEan(ean) : '') || '').trim()
      return {
        src,
        ean_code: ean,
        product_id: v.product_id ?? v.id,
        color: v.color ?? v.colour ?? g.color ?? '',
        variant: v
      }
    })

    const imgs = uniqByKey(
      imgsRaw.filter((x) => isRealRemoteImage(x.src) && x.ean_code),
      (x) => `${x.ean_code}::${x.src}`
    )

    const missingEanLabel = uniqNonEmptyStrings(g.variants.map((v) => v?.ean_code)).join(', ')

    out.push({
      ...g,
      images: imgs,
      ean_code: imgs[0]?.ean_code || g.variants[0]?.ean_code || '',
      id: g.rep.id,
      product_id: g.rep.product_id,
      brand: g.brand || g.rep.brand,
      product_name: g.product_name || g.rep.product_name,
      is_out_of_stock: isOutOfStock,
      has_matching_images: imgs.length > 0,
      missing_ean_label: missingEanLabel
    })
  }
  return out
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

function EmptyState() {
  const brands = ['Twin Birds', 'Naidu Hall', 'Intimacy', 'Aswathi', 'Indian Flower', 'Jockey']
  return (
    <div className="wds-empty">
      <div className="wds-empty-card">
        <div className="wds-empty-top">
          <span className="wds-empty-badge">No products found</span>
          <h3 className="wds-empty-title">Try our popular brands</h3>
          <p className="wds-empty-sub">Pick a brand below, or reset your filters and browse everything.</p>
        </div>

        <div className="wds-empty-actions">
          <Link to="/women" className="wds-empty-btn primary">
            Explore Women’s Store
          </Link>
          <button type="button" className="wds-empty-btn" onClick={() => window.location.assign('/women')}>
            Reset
          </button>
        </div>

        <div className="wds-empty-grid">
          {brands.map((b) => (
            <Link key={b} to={`/women?brand=${encodeURIComponent(b)}`} className="wds-empty-brand">
              <div className="wds-empty-media">
                <img src={buildBrandImage(b)} alt={b} loading="lazy" decoding="async" />
                <div className="wds-empty-overlay" />
                <div className="wds-empty-name">{b}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function WomenDisplayPage({
  products,
  userType,
  loading,
  error,
  likedKeys,
  keyFor,
  onToggleLike,
  onProductClick
}) {
  const [popupProduct, setPopupProduct] = useState(null)
  const sectionRef = useRef(null)

  const groupedRaw = useMemo(() => groupProductsByColor(products || []), [products])

  const grouped = useMemo(() => {
    const list = [...(groupedRaw || [])]
    list.sort((a, b) => {
      const aHas = a?.has_matching_images ? 1 : 0
      const bHas = b?.has_matching_images ? 1 : 0
      if (aHas !== bHas) return bHas - aHas
      return String(a?.product_name || '').localeCompare(String(b?.product_name || ''))
    })
    return list
  }, [groupedRaw])

  const getPriceFields = (g) => {
    const p = g.price_fields || g || {}
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
  }

  const fmtMoney = (v) => {
    const n = Number(v)
    const safe = Number.isFinite(n) ? n : 0
    return `₹${safe.toFixed(2)}`
  }

  const discountPct = (g) => {
    const { offer, mrp } = getPriceFields(g)
    if (!mrp || mrp <= 0) return 0
    if (!offer || offer <= 0 || offer >= mrp) return 0
    const pct = ((mrp - offer) / mrp) * 100
    return Math.max(0, Math.round(pct))
  }

  const getImgForGroup = (group) => {
    const img = group.images?.[0]?.src
    if (img) return img
    const gender = group.gender || group.rep?.gender || 'WOMEN'
    return DEFAULT_IMG_BY_GENDER[gender] || DEFAULT_IMG_BY_GENDER._
  }

  const canLike = (group) => {
    const ean = group?.ean_code || group?.rep?.ean_code || ''
    return !!String(ean).trim()
  }

  const toPayload = (group) => {
    const active = group.images?.[0] || null
    const rep = active?.variant || group.variants?.[0] || group.rep || group
    return {
      ...rep,
      ean_code: active?.ean_code || rep.ean_code || group.ean_code,
      image_url: active?.src || rep.image_url || getImgForGroup(group),
      variants: group.variants,
      images: (group.images || []).map((x) => x.src)
    }
  }

  const handleCardClick = (group) => onProductClick(toPayload(group))
  const openPopup = (group) => setPopupProduct(toPayload(group))

  const userLabel = userType === 'B2B' ? 'B2B prices' : 'Retail prices'

  return (
    <section ref={sectionRef} className="womens-section4" id="women-display">
      <div className="section-head">
        <div className="section-head-left">
          <h2>Women’s Collection</h2>
          <p className="section-sub">Fresh picks, clean fits, everyday comfort</p>
        </div>
        <div className="section-head-right">
          <span className="count">{grouped.length} items</span>
          <span className="user-pill">{userLabel}</span>
        </div>
      </div>

      {loading ? (
        <div className="wds-skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="wds-skeleton-card" key={i}>
              <div className="wds-skeleton-img" />
              <div className="wds-skeleton-lines">
                <div className="wds-skeleton-line" />
                <div className="wds-skeleton-line short" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="state-card error-state">{error}</div>
      ) : !grouped.length ? (
        <EmptyState />
      ) : (
        <div className="womens-section4-grid">
          {grouped.map((group, index) => {
            const active = group.images?.[0] || null
            const { offer, mrp } = getPriceFields(group)
            const discount = discountPct(group)
            const hasVariants = group.variants && group.variants.length > 1
            const isOutOfStock = group.is_out_of_stock
            const likeEnabled = canLike(group)
            const imgSrc = getImgForGroup(group)

            const activeEan = String(active?.ean_code || group.ean_code || group.rep?.ean_code || '')
            const liked = likedKeys.has(
              keyFor({
                product_id: group.product_id || group.id,
                ean_code: activeEan
              })
            )

            const showMissingEan = !group.has_matching_images && !!String(group.missing_ean_label || '').trim()
            const showMrp = mrp > offer && offer > 0 && mrp > 0

            return (
              <div
                key={group.key || index}
                className={`womens-section4-card${isOutOfStock ? ' out-of-stock' : ''}`}
                onClick={() => handleCardClick(group)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCardClick(group)
                }}
              >
                <div className="womens-section4-img">
                  {showMissingEan && (
                    <div className="missing-ean-pill">
                      <span>Missing image for EAN: {group.missing_ean_label}</span>
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="discount-ribbon">
                      <span>{discount}% OFF</span>
                    </div>
                  )}

                  {hasVariants && <div className="variant-pill">{group.variants.length} sizes</div>}

                  <img
                    src={imgSrc}
                    alt={group.product_name}
                    className="fade-image"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const gender = group.gender || group.rep?.gender || 'WOMEN'
                      const fallback = DEFAULT_IMG_BY_GENDER[gender] || DEFAULT_IMG_BY_GENDER._
                      if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback
                    }}
                  />

                  {isOutOfStock && (
                    <div className="out-of-stock-overlay">
                      <span>Out of Stock</span>
                    </div>
                  )}

                  <div className="action-icons">
                    <button
                      type="button"
                      className={`action-icon${likeEnabled ? '' : ' disabled'}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!likeEnabled) return
                        onToggleLike(group, {
                          ean_code: activeEan,
                          image_url: String(active?.src || imgSrc || ''),
                          color: String(group.color || '')
                        })
                      }}
                      aria-label="Add to wishlist"
                    >
                      {liked ? <FaHeart className="gold-ico" /> : <FaRegHeart className="gold-ico" />}
                    </button>

                    <button
                      type="button"
                      className="action-icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        openPopup(group)
                      }}
                      aria-label="Quick view"
                    >
                      <FaEye className="gold-ico" />
                    </button>
                  </div>
                </div>

                <div className="womens-section4-body">
                  <div className="brand-row">
                    <h4 className="brand-name">{group.brand}</h4>
                    <span className="brand-chip">Top pick</span>
                  </div>

                  <h5 className="product-name">{group.product_name}</h5>

                  <div className="card-price-row">
                    <span className="card-offer-price">{fmtMoney(offer)}</span>
                    {showMrp && <span className="card-original-price">{fmtMoney(mrp)}</span>}
                    {discount > 0 && <span className="card-discount-chip">{discount}% off</span>}
                  </div>

                  <div className="womens-section4-meta">
                    <span className="price-type">{userType === 'B2B' ? 'Best B2B price' : 'Inclusive of all taxes'}</span>
                    {discount > 0 && <span className="saving-text">Save more today</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {popupProduct && <FullDetailsPopup product={popupProduct} onClose={() => setPopupProduct(null)} />}
    </section>
  )
}