import React from 'react'
import './KidsDisplayPage.css'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

const DEFAULT_IMG = '/images/kids/kids-girls-frock.jpg'
const toArray = (x) => (Array.isArray(x) ? x : [])

export default function KidsDisplayPage({
  products,
  userType,
  loading,
  error,
  likedKeys,
  keyFor,
  onToggleLike,
  onProductClick,
  priceForUser,
  mrpForUser,
  discountPct
}) {
  const items = toArray(products)

  return (
    <section className="kids-section4">
      <div className="kids-collection-head">
        <div className="kids-collection-head-left">
          <h2>Kids Collection</h2>
          <p className="kids-collection-subtitle">Playful looks for every little moment</p>
        </div>
        <div className="kids-collection-count">{items.length} styles</div>
      </div>

      {loading ? (
        <div className="kids-notice">Loading cute styles…</div>
      ) : error ? (
        <div className="kids-notice">{error}</div>
      ) : !items.length ? (
        <div className="kids-notice">No products found. Try adjusting your filters.</div>
      ) : (
        <div className="kids-section4-grid">
          {items.map((product, idx) => {
            const liked = likedKeys.has(keyFor(product))
            const dPct = discountPct(product)
            const price = Number(priceForUser(product) || 0)
            const mrp = Number(mrpForUser(product) || 0)
            return (
              <div
                key={product.id || product.product_id || idx}
                className="kids-section4-card"
                onClick={() => onProductClick(product)}
              >
                <div className="kids-section4-img">
                  <img
                    src={product.image_url || DEFAULT_IMG}
                    alt={product.product_name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMG
                    }}
                  />
                  <div
                    className="kids-love-icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleLike(product)
                    }}
                  >
                    {liked ? (
                      <FaHeart className="kids-love-icon-heart active" />
                    ) : (
                      <FaRegHeart className="kids-love-icon-heart" />
                    )}
                  </div>
                  {dPct > 0 && (
                    <div className="kids-badge kids-badge-discount">
                      {dPct}% OFF
                    </div>
                  )}
                </div>

                <div className="kids-card-body">
                  <div className="kids-brand-name">{product.brand}</div>
                  <div className="kids-product-name">{product.product_name}</div>

                  <div className="kids-section4-price">
                    <span className="kids-offer-price">
                      ₹{price.toFixed(2)}
                    </span>
                    {mrp > price && (
                      <span className="kids-original-price">
                        ₹{mrp.toFixed(2)}
                      </span>
                    )}
                    {dPct > 0 && (
                      <span className="kids-discount">{dPct}% OFF</span>
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
