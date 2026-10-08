import React, { useEffect, useMemo, useState } from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { formatPrice, getPrice } from '../services/productsApi'
import './ProductCard.css'
import { imageSources } from '../services/productImages'
import useProductWishlist from '../hooks/useProductWishlist'

const clean = value => String(value || '').trim()
const unique = values => [...new Set(values.map(clean).filter(Boolean))]
const slugFor = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

function ProductImage({ product }) {
  const gender = clean(product?.gender || product?.categoryRoot || product?.category_root).toUpperCase()
  const fallback = gender === 'MEN' ? '/images/defaults/attach-men.svg' : gender === 'KIDS' ? '/images/defaults/attach-kids.svg' : '/images/defaults/attach-women.svg'
  const sources = useMemo(() => unique([
    ...imageSources(product),
    product?.shared_image_url,
    product?.front_image_url,
    product?.main_image_url,
    product?.image_url,
    
    ...(Array.isArray(product?.variants) ? product.variants.flatMap(variant => [variant?.shared_image_url, variant?.front_image_url, variant?.main_image_url, variant?.image_url]) : []),
    fallback
  ]), [product, fallback])
  const sourceKey = sources.join('|')
  const [index, setIndex] = useState(0)
  useEffect(() => setIndex(0), [sourceKey])
  return <img src={sources[Math.min(index, sources.length - 1)]} alt={product?.name || product?.product_name || 'Product'} loading="lazy" onError={() => setIndex(current => Math.min(current + 1, sources.length - 1))} />
}

export default function ProductCard({ product, userType = 'B2C', liked = false, onWishlist, listingMode = false }) {
  const navigate = useNavigate()
  const { save, saved, pending, message } = useProductWishlist(product)
  const isLiked = liked || saved
  const price = getPrice(product, userType)
  const discount = price.original > price.final ? Math.round(((price.original - price.final) / price.original) * 100) : 0
  const openProduct = () => {
    if (listingMode) {
      const gender = clean(product?.gender || product?.categoryRoot || product?.category_root || 'women').toLowerCase()
      const categorySlug = clean(product?.categorySlug || product?.category_slug) || slugFor(product?.category || product?.category_name || 'all')
      navigate(`/shop/${gender}/${categorySlug || 'all'}`)
      return
    }
    sessionStorage.setItem('attach:return-position', JSON.stringify({ url: `${window.location.pathname}${window.location.search}`, y: window.scrollY, time: Date.now() }))
    sessionStorage.setItem('selectedProduct', JSON.stringify(product))
    const variant = product?.variants?.find(item => Number(item?.variant_id || item?.id) > 0)
    const variantId = Number(product?.variantId || product?.variant_id || variant?.variant_id || variant?.id || product?.productId || product?.product_id || product?.id)
    if (!Number.isInteger(variantId) || variantId <= 0) return
    navigate(`/product/${encodeURIComponent(variantId)}`)
  }
  return <article className="tara-product-card" tabIndex={0} role="link" aria-label={`View ${product.name}`} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openProduct() } }} onClick={openProduct}><div className="tara-product-media">{discount > 0 && <span className="tara-product-sale">{discount}% OFF</span>}<button className={`tara-product-heart ${isLiked ? 'is-liked' : ''}`} onClick={event => { event.stopPropagation(); onWishlist ? onWishlist(product) : save() }} disabled={pending} aria-pressed={isLiked} aria-label={isLiked ? 'Saved to wishlist' : 'Add to wishlist'}>{isLiked ? <FaHeart /> : <FaRegHeart />}</button><ProductImage product={product} /></div><div className="tara-product-copy"><span>{product.brand}</span><h3>{product.name}</h3><div className="tara-product-price"><strong>{formatPrice(price.final)}</strong>{price.original > price.final && <del>{formatPrice(price.original)}</del>}</div><p>{String(userType).toUpperCase() === 'B2B' ? 'Wholesale price' : 'Inclusive of taxes'}</p>{message && <small role="status">{message}</small>}</div></article>
}
