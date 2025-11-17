import React, { useMemo, useState, useEffect } from 'react'
import './WomenDisplayPage.css'
import { FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const CLOUD_NAME = 'deymt9uyh'
const DEFAULT_IMG = '/images/women/women20.jpeg'

function cloudinaryUrlByEan(ean) {
  if (!ean) return ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/products/${ean}`
}

function uniq(arr) {
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
  const [carouselIndex, setCarouselIndex] = useState({})

  const grouped = useMemo(() => {
    const byKey = new Map()
    for (const p of products) {
      const k = p.ean_code || `__noean__:${p.product_id || p.id}`
      if (!byKey.has(k)) {
        byKey.set(k, {
          key: k,
          ean_code: p.ean_code || '',
          brand: p.brand,
          product_name: p.product_name,
          price_fields: {
            original_price_b2c: p.original_price_b2c,
            final_price_b2c: p.final_price_b2c,
            original_price_b2b: p.original_price_b2b,
            final_price_b2b: p.final_price_b2b
          },
          rep: p,
          variants: []
        })
      }
      byKey.get(k).variants.push(p)
    }
    const out = []
    for (const g of byKey.values()) {
      const imgs = uniq([
        ...g.variants.map((v) => v.image_url),
        g.ean_code ? cloudinaryUrlByEan(g.ean_code) : ''
      ])
      out.push({
        ...g,
        images: imgs,
        id: g.rep.id,
        product_id: g.rep.product_id,
        brand: g.brand || g.rep.brand,
        product_name: g.product_name || g.rep.product_name
      })
    }
    return out
  }, [products])

  useEffect(() => {
    const init = {}
    for (const g of grouped) {
      init[g.key] = 0
    }
    setCarouselIndex(init)
  }, [grouped])

  const priceForUser = (g) => {
    const p = g.price_fields || {}
    return userType === 'B2B' ? p.final_price_b2b || p.final_price_b2c : p.final_price_b2c
  }

  const mrpForUser = (g) => {
    const p = g.price_fields || {}
    return userType === 'B2B' ? p.original_price_b2b || p.original_price_b2c : p.original_price_b2c
  }

  const discountPct = (g) => {
    const mrp = Number(mrpForUser(g) || 0)
    const price = Number(priceForUser(g) || 0)
    if (!mrp || mrp <= 0) return 0
    const pct = ((mrp - price) / mrp) * 100
    return Math.max(0, Math.round(pct))
  }

  const nextImg = (group, e) => {
    e?.stopPropagation?.()
    setCarouselIndex((prev) => {
      const i = prev[group.key] || 0
      const n = group.images?.length || 1
      return { ...prev, [group.key]: (i + 1) % n }
    })
  }

  const prevImg = (group, e) => {
    e?.stopPropagation?.()
    setCarouselIndex((prev) => {
      const i = prev[group.key] || 0
      const n = group.images?.length || 1
      return { ...prev, [group.key]: (i - 1 + n) % n }
    })
  }

  const handleCardClick = (group) => {
    const idx = carouselIndex[group.key] || 0
    const enriched = { ...group, activeIndex: idx }
    onProductClick(enriched)
  }

  const userLabel = userType === 'B2B' ? 'B2B view' : 'Retail view'

  return (
    <section className="womens-section4">
      <div className="section-head">
        <div className="section-head-left">
          <h2>Women’s Collection</h2>
          <p className="section-sub">Soft fabrics, sharp fits, all-day comfort</p>
        </div>
        <div className="section-head-right">
          <span className="count">{grouped.length} items</span>
          <span className="user-pill">{userLabel}</span>
        </div>
      </div>

      {loading ? (
        <div className="state-card">Loading products…</div>
      ) : error ? (
        <div className="state-card error-state">{error}</div>
      ) : !grouped.length ? (
        <div className="state-card">No products found</div>
      ) : (
        <div className="womens-section4-grid">
          {grouped.map((group, index) => {
            const liked = likedKeys.has(keyFor(group))
            const idx = carouselIndex[group.key] || 0
            const imgSrc =
              group.images?.[idx] ||
              (group.ean_code ? cloudinaryUrlByEan(group.ean_code) : '') ||
              DEFAULT_IMG
            const total = group.images?.length || 1
            const discount = discountPct(group)
            const hasVariants = group.variants && group.variants.length > 1

            return (
              <div
                key={group.key || index}
                className="womens-section4-card"
                onClick={() => handleCardClick(group)}
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
                    src={imgSrc}
                    alt={group.product_name}
                    className="fade-image"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = DEFAULT_IMG
                    }}
                  />
                  {total > 1 && (
                    <>
                      <button
                        className="carousel-arrow left"
                        onClick={(e) => prevImg(group, e)}
                        aria-label="Previous"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        className="carousel-arrow right"
                        onClick={(e) => nextImg(group, e)}
                        aria-label="Next"
                      >
                        <FaChevronRight />
                      </button>
                      <div className="carousel-dots">
                        {group.images.map((_, i) => (
                          <span
                            key={i}
                            className={i === idx ? 'dot active' : 'dot'}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCarouselIndex((prev) => ({ ...prev, [group.key]: i }))
                            }}
                          />
                        ))}
                      </div>
                      <div className="carousel-count">
                        {idx + 1}/{total}
                      </div>
                    </>
                  )}
                  <div
                    className="love-icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleLike(group)
                    }}
                  >
                    {liked ? (
                      <FaHeart style={{ color: 'gold', fontSize: '20px' }} />
                    ) : (
                      <FaRegHeart style={{ color: 'gold', fontSize: '20px' }} />
                    )}
                  </div>
                </div>

                <div className="womens-section4-body">
                  <div className="brand-row">
                    <h4 className="brand-name">{group.brand}</h4>
                    <span className="brand-chip">New in</span>
                  </div>
                  <h5 className="product-name">{group.product_name}</h5>
                  <div className="card-price-row">
                    <span className="card-offer-price">
                      ₹{Number(priceForUser(group) || 0).toFixed(2)}
                    </span>
                    <span className="card-original-price">
                      ₹{Number(mrpForUser(group) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="womens-section4-meta">
                    <span className="price-type">
                      {userType === 'B2B' ? 'Best B2B margin' : 'Inclusive of all taxes'}
                    </span>
                    {discount > 0 && (
                      <span className="saving-text">You save {discount}%</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
