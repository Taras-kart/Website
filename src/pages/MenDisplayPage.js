import React from 'react'
import './MenDisplayPage.css'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

const CLOUD_NAME = 'deymt9uyh'
const DEFAULT_IMG = '/images/men/mens13.jpeg'

function cloudinaryUrlByEan(ean) {
  if (!ean) return ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/products/${ean}`
}

function priceForUser(p, userType) {
  return userType === 'B2B' ? p.final_price_b2b || p.final_price_b2c : p.final_price_b2c
}

function mrpForUser(p, userType) {
  return userType === 'B2B' ? p.original_price_b2b || p.original_price_b2c : p.original_price_b2c
}

function discountPct(p, userType) {
  const mrp = Number(mrpForUser(p, userType) || 0)
  const price = Number(priceForUser(p, userType) || 0)
  if (!mrp || mrp <= 0) return 0
  const pct = ((mrp - price) / mrp) * 100
  return Math.max(0, Math.round(pct))
}

export default function MenDisplayPage({
  products,
  userType,
  loading,
  error,
  likedKeys,
  keyFor,
  onToggleLike,
  onProductClick
}) {
  const items = Array.isArray(products) ? products : []

  return (
    <section className="mens-section4">
      <div className="mens-collection-head">
        <div className="mens-collection-head-left">
          <h2>Men’s Collection</h2>
          <p className="mens-collection-subtitle">Sharp fits, clean lines and everyday essentials</p>
        </div>
        <div className="mens-collection-count">{items.length} styles</div>
      </div>

      {loading ? (
        <div className="mens-notice">Loading your styles…</div>
      ) : error ? (
        <div className="mens-notice">{error}</div>
      ) : !items.length ? (
        <div className="mens-notice">No products found. Try changing your filters.</div>
      ) : (
        <div className="mens-section4-grid">
          {items.map((product, idx) => {
            const liked = likedKeys.has(keyFor(product))
            const dPct = discountPct(product, userType)
            const price = Number(priceForUser(product, userType) || 0)
            const mrp = Number(mrpForUser(product, userType) || 0)
            return (
              <div
                key={product.product_id || product.id || idx}
                className="mens-section4-card"
                onClick={() => onProductClick(product)}
              >
                <div className="mens-section4-img">
                  <img
                    src={product.image_url || DEFAULT_IMG}
                    alt={product.product_name}
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.dataset.fallbackApplied) {
                        e.currentTarget.src = DEFAULT_IMG
                        return
                      }
                      e.currentTarget.dataset.fallbackApplied = '1'
                      e.currentTarget.src = product.ean_code
                        ? cloudinaryUrlByEan(product.ean_code)
                        : DEFAULT_IMG
                    }}
                  />
                  <div
                    className="mens-love-icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleLike(product)
                    }}
                  >
                    {liked ? (
                      <FaHeart className="mens-love-icon-heart active" />
                    ) : (
                      <FaRegHeart className="mens-love-icon-heart" />
                    )}
                  </div>
                  {dPct > 0 && (
                    <div className="mens-badge mens-badge-discount">
                      {dPct}% OFF
                    </div>
                  )}
                </div>

                <div className="mens-card-body">
                  <div className="mens-brand-name">{product.brand}</div>
                  <div className="mens-product-name">{product.product_name}</div>

                  {(product.color || product.size) && (
                    <div className="mens-meta-row">
                      {product.color && (
                        <span className="mens-meta-pill">
                          {product.color}
                        </span>
                      )}
                      {product.size && (
                        <span className="mens-meta-pill">
                          Size {product.size}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mens-section4-price">
                    <span className="mens-offer-price">
                      ₹{price.toFixed(2)}
                    </span>
                    {mrp > price && (
                      <span className="mens-original-price">
                        ₹{mrp.toFixed(2)}
                      </span>
                    )}
                    {dPct > 0 && (
                      <span className="mens-discount">{dPct}% OFF</span>
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
