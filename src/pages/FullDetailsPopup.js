import React, { useCallback, useEffect, useMemo, useState } from 'react'
import './FullDetailsPopup.css'
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const FALLBACK_IMG = '/images/women/women20.jpeg'

const isRemote = (src) => {
  const s = String(src || '')
  return s.startsWith('http://') || s.startsWith('https://')
}

const uniqNonEmpty = (arr) => {
  const seen = new Set()
  const out = []
  for (const v of arr || []) {
    const s = String(v || '').trim()
    if (!s) continue
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
  }
  return out
}

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : 0
}

const getPriceFields = (p, userType) => {
  if (userType === 'B2B') {
    const offerCandidates = [p.final_price_b2b, p.sale_price, p.mrp, p.original_price_b2b, p.original_price_b2c]
    const mrpCandidates = [p.mrp, p.original_price_b2b, p.original_price_b2c, p.final_price_b2b, p.sale_price]
    const offer = offerCandidates.map(num).find((x) => x > 0) || 0
    const mrp = mrpCandidates.map(num).find((x) => x > 0) || offer
    return { offer, mrp }
  }
  const offerCandidates = [p.final_price_b2c, p.sale_price, p.mrp, p.original_price_b2c]
  const mrpCandidates = [p.mrp, p.original_price_b2c, p.final_price_b2c, p.sale_price]
  const offer = offerCandidates.map(num).find((x) => x > 0) || 0
  const mrp = mrpCandidates.map(num).find((x) => x > 0) || offer
  return { offer, mrp }
}

const discountPct = (p, userType) => {
  const { offer, mrp } = getPriceFields(p, userType)
  if (!mrp || mrp <= 0) return 0
  if (!offer || offer <= 0 || offer >= mrp) return 0
  return Math.max(0, Math.round(((mrp - offer) / mrp) * 100))
}

export default function FullDetailsPopup({ product, onClose, userType = 'B2C' }) {
  const variants = useMemo(() => product?.variants || [], [product])

  const images = useMemo(() => {
    const srcs = uniqNonEmpty([
      ...(product?.images || []),
      product?.image_url,
      ...variants.map((v) => v?.image_url)
    ]).filter((s) => isRemote(s))
    return srcs.length ? srcs : [FALLBACK_IMG]
  }, [product, variants])

  const sizes = useMemo(() => {
    const list = uniqNonEmpty(variants.map((v) => v?.size))
    const cleaned = list.filter((s) => String(s).toLowerCase() !== 'null' && String(s).toLowerCase() !== 'undefined')
    return cleaned.length ? cleaned : uniqNonEmpty([product?.size]).filter(Boolean)
  }, [variants, product])

  const colors = useMemo(() => {
    const list = uniqNonEmpty(variants.map((v) => v?.color))
    const cleaned = list.filter((s) => String(s).toLowerCase() !== 'null' && String(s).toLowerCase() !== 'undefined')
    return cleaned.length ? cleaned : uniqNonEmpty([product?.color]).filter(Boolean)
  }, [variants, product])

  const initialVariant = useMemo(() => {
    const byEan = variants.find((v) => String(v?.ean_code || '') === String(product?.ean_code || ''))
    return byEan || variants[0] || product || {}
  }, [variants, product])

  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(String(initialVariant?.size || ''))
  const [selectedVariant, setSelectedVariant] = useState(initialVariant)

  useEffect(() => {
    setSelectedVariant(initialVariant)
    setSelectedSize(String(initialVariant?.size || ''))
    const target = String(initialVariant?.image_url || product?.image_url || '')
    const idx = images.findIndex((s) => s === target)
    setActiveIndex(idx >= 0 ? idx : 0)
  }, [initialVariant, product, images])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  useEffect(() => {
    if (!selectedSize) return
    const v = variants.find((x) => String(x?.size || '') === String(selectedSize || '')) || variants[0] || product || {}
    setSelectedVariant(v)
    const target = String(v?.image_url || '')
    if (target) {
      const idx = images.findIndex((s) => s === target)
      if (idx >= 0) setActiveIndex(idx)
    }
  }, [selectedSize, variants, product, images])

  const closeSafe = useCallback(() => {
    onClose?.()
  }, [onClose])

  const next = useCallback(() => setActiveIndex((i) => (i + 1) % images.length), [images.length])
  const prev = useCallback(() => setActiveIndex((i) => (i - 1 + images.length) % images.length), [images.length])

  if (!product) return null

  const activeImg = images[activeIndex] || images[0] || FALLBACK_IMG

  const name = selectedVariant?.product_name || product?.product_name || ''
  const brand = selectedVariant?.brand || product?.brand || ''
  const gender = selectedVariant?.gender || product?.gender || ''
  const color = selectedVariant?.color || product?.color || ''
  const size = selectedVariant?.size || product?.size || ''

  const availableQty =
    selectedVariant?.available_qty !== undefined
      ? Number(selectedVariant.available_qty)
      : selectedVariant?.on_hand !== undefined
      ? Number(selectedVariant.on_hand)
      : product?.available_qty !== undefined
      ? Number(product.available_qty)
      : product?.on_hand !== undefined
      ? Number(product.on_hand)
      : 0

  const inStock =
    selectedVariant?.in_stock === true ||
    product?.in_stock === true ||
    (Number.isFinite(availableQty) && availableQty > 0)

  const { offer, mrp } = getPriceFields(selectedVariant || product || {}, userType)
  const pct = discountPct(selectedVariant || product || {}, userType)
  const saved = mrp > offer ? Math.max(0, mrp - offer) : 0

  return (
    <div className="fdp-overlay" onMouseDown={closeSafe}>
      <div className="fdp-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="fdp-close" onClick={closeSafe} aria-label="Close">
          <FaTimes />
        </button>

        <div className="fdp-layout">
          <div className="fdp-left">
            <div className="fdp-imageCard">
              <div className="fdp-badges">
                <span className={`fdp-stock ${inStock ? 'in' : 'out'}`}>{inStock ? 'In stock' : 'Out of stock'}</span>
                {pct > 0 && <span className="fdp-discount">{pct}% OFF</span>}
              </div>

              <img
                className="fdp-mainImg"
                src={activeImg}
                alt={name}
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_IMG) e.currentTarget.src = FALLBACK_IMG
                }}
              />

              {images.length > 1 && (
                <>
                  <button className="fdp-nav left" onClick={prev} aria-label="Previous image">
                    <FaChevronLeft />
                  </button>
                  <button className="fdp-nav right" onClick={next} aria-label="Next image">
                    <FaChevronRight />
                  </button>
                  <div className="fdp-count">
                    {activeIndex + 1}/{images.length}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="fdp-thumbs">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    className={`fdp-thumb ${i === activeIndex ? 'active' : ''}`}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Image ${i + 1}`}
                  >
                    <img
                      src={src}
                      alt=""
                      onError={(e) => {
                        if (e.currentTarget.src !== FALLBACK_IMG) e.currentTarget.src = FALLBACK_IMG
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="fdp-right">
            <div className="fdp-header">
              <div className="fdp-brandRow">
                <div className="fdp-brand">{brand || 'Brand'}</div>
                <div className="fdp-pill">{userType === 'B2B' ? 'B2B' : 'Retail'}</div>
              </div>
              <div className="fdp-title">{name || 'Product'}</div>
              <div className="fdp-subline">
                <span className="fdp-subchip">{gender || 'Women'}</span>
                {color ? <span className="fdp-subchip">{color}</span> : null}
                {size ? <span className="fdp-subchip">Size {size}</span> : null}
              </div>
            </div>

            <div className="fdp-priceCard">
              <div className="fdp-priceTop">
                <div className="fdp-offer">₹{Number(offer || 0).toFixed(2)}</div>
                {mrp > offer ? <div className="fdp-mrp">₹{Number(mrp || 0).toFixed(2)}</div> : null}
                {pct > 0 ? <div className="fdp-save">Save {pct}%</div> : null}
              </div>
              {saved > 0 ? <div className="fdp-savedLine">You save ₹{Number(saved).toFixed(2)}</div> : null}
              <div className="fdp-note">{userType === 'B2B' ? 'Best B2B pricing shown' : 'Inclusive of all taxes'}</div>
            </div>

            <div className="fdp-divider" />

            <div className="fdp-section">
              <div className="fdp-sectionTitle">Choose size</div>
              {sizes.length ? (
                <div className="fdp-sizes">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      className={`fdp-sizeBtn ${String(s) === String(selectedSize) ? 'active' : ''}`}
                      onClick={() => setSelectedSize(String(s))}
                      disabled={!inStock && String(s) === String(selectedSize)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="fdp-muted">Size not available</div>
              )}
            </div>

            <div className="fdp-divider" />

            <div className="fdp-section">
              <div className="fdp-sectionTitle">Highlights</div>
              <div className="fdp-highlights">
                <div className="fdp-hItem">
                  <div className="fdp-hLabel">Availability</div>
                  <div className="fdp-hValue">{inStock ? `${Math.max(availableQty, 1)} left` : 'Out of stock'}</div>
                </div>
                <div className="fdp-hItem">
                  <div className="fdp-hLabel">Color</div>
                  <div className="fdp-hValue">{color || '—'}</div>
                </div>
                <div className="fdp-hItem">
                  <div className="fdp-hLabel">Size</div>
                  <div className="fdp-hValue">{selectedSize || '—'}</div>
                </div>
                {colors.length > 1 ? (
                  <div className="fdp-hItem">
                    <div className="fdp-hLabel">More colors</div>
                    <div className="fdp-hValue">
                      {colors.slice(0, 3).join(', ')}
                      {colors.length > 3 ? '…' : ''}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
