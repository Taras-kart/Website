import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiHeart, FiHelpCircle, FiMinus, FiPackage, FiPlus, FiShare2, FiShoppingBag } from 'react-icons/fi'
import Footer from './Footer'
import './ProductDetailsPage.css'
import { useCart } from '../CartContext'
import { useWishlist } from '../WishlistContext'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE = ((typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) || DEFAULT_API_BASE).replace(/\/+$/, '')
const CLOUD = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_CLOUDINARY_CLOUD) || 'deymt9uyh'
const clean = value => String(value || '').trim()
const unique = values => [...new Set(values.map(clean).filter(Boolean))]
const positiveId = value => { const number = Number(value); return Number.isInteger(number) && number > 0 ? number : null }
const fallbackFor = gender => clean(gender).toUpperCase() === 'MEN' ? '/images/men/mens13.jpeg' : clean(gender).toUpperCase() === 'KIDS' ? '/images/kids/kids-girls-frock.jpg' : '/images/women/women20.jpeg'
const imageCandidates = product => {
  const ean = clean(product?.ean_code)
  return unique([product?.shared_image_url, product?.variant_image_url, product?.ean_image_url, product?.image_url, ...(Array.isArray(product?.images) ? product.images : []), ean ? `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto/products/${encodeURIComponent(ean)}` : ''])
}
const pricingFor = (product, type) => {
  const b2b = clean(type).toUpperCase() === 'B2B'
  const mrp = Number(b2b ? product?.original_price_b2b || product?.mrp : product?.original_price_b2c || product?.mrp) || 0
  const price = Number(b2b ? product?.final_price_b2b || product?.sale_price : product?.final_price_b2c || product?.sale_price) || mrp
  return { mrp, price, discount: mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0 }
}
const money = value => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function SafeImage({ sources, alt, className }) {
  const key = sources.join('|')
  const [index, setIndex] = useState(0)
  useEffect(() => setIndex(0), [key])
  return <img className={className} src={sources[Math.min(index, sources.length - 1)]} alt={alt} onError={() => setIndex(current => Math.min(current + 1, sources.length - 1))} />
}

export default function ProductDetailsPage() {
  const { variantId } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { addToWishlist } = useWishlist()
  const [baseProduct, setBaseProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [selectedVariantId, setSelectedVariantId] = useState(positiveId(variantId))
  const [activeImage, setActiveImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const userType = typeof window === 'undefined' ? 'B2C' : sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C'

  useEffect(() => {
    const id = positiveId(variantId)
    if (!id) { setError('Invalid product link'); setLoading(false); return undefined }
    const controller = new AbortController()
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`${API_BASE}/api/products/${id}`, { signal: controller.signal, cache: 'no-store' })
        if (!response.ok) throw new Error(response.status === 404 ? 'Product not found' : 'Unable to load this product')
        const product = await response.json()
        setBaseProduct(product)
        const query = encodeURIComponent(clean(product?.product_name || product?.name))
        const variantsResponse = await fetch(`${API_BASE}/api/products?limit=5000&hasImage=true&q=${query}`, { signal: controller.signal, cache: 'no-store' })
        const data = variantsResponse.ok ? await variantsResponse.json() : []
        const rows = (Array.isArray(data) ? data : data?.products || []).filter(row => Number(row?.product_id) === Number(product?.product_id))
        setVariants(rows.length ? rows : [product])
        setSelectedVariantId(id)
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError?.message || 'Unable to load this product')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [variantId])

  const selected = useMemo(() => variants.find(item => Number(item?.id) === Number(selectedVariantId)) || baseProduct, [variants, selectedVariantId, baseProduct])
  const colourGroups = useMemo(() => {
    const groups = new Map()
    variants.forEach(item => {
      const colour = clean(item?.color || item?.colour) || 'Default'
      if (!groups.has(colour)) groups.set(colour, { colour, item, images: [] })
      groups.get(colour).images = unique([...groups.get(colour).images, ...imageCandidates(item)])
    })
    return [...groups.values()]
  }, [variants])
  const selectedColour = clean(selected?.color || selected?.colour) || 'Default'
  const sizes = useMemo(() => unique(variants.filter(item => (clean(item?.color || item?.colour) || 'Default') === selectedColour).map(item => item?.size)), [variants, selectedColour])
  const galleryImages = useMemo(() => unique([...imageCandidates(selected), ...variants.filter(item => (clean(item?.color || item?.colour) || 'Default') === selectedColour).flatMap(imageCandidates), fallbackFor(selected?.gender)]), [selected, selectedColour, variants])
  const mainImage = activeImage && galleryImages.includes(activeImage) ? activeImage : galleryImages[0]
  const pricing = pricingFor(selected, userType)
  const productName = clean(selected?.product_name || selected?.name || 'Product')
  const stock = Number(selected?.total_count ?? selected?.stock ?? selected?.available_stock ?? 0)
  useEffect(() => setActiveImage(''), [selectedVariantId])

  const chooseColour = colour => { const next = variants.find(item => (clean(item?.color || item?.colour) || 'Default') === colour); if (next) setSelectedVariantId(positiveId(next.id)) }
  const chooseSize = size => { const next = variants.find(item => clean(item?.size) === size && (clean(item?.color || item?.colour) || 'Default') === selectedColour); if (next) setSelectedVariantId(positiveId(next.id)) }
  const notify = text => { setMessage(text); window.setTimeout(() => setMessage(''), 2200) }
  const itemPayload = () => ({ ...baseProduct, ...selected, variant_id: positiveId(selected?.id), product_id: positiveId(selected?.product_id || baseProduct?.product_id), selectedColor: selectedColour === 'Default' ? '' : selectedColour, selectedSize: clean(selected?.size), image_url: mainImage, quantity })
  const addBag = async destination => {
    const item = itemPayload()
    if (!item.variant_id) return notify('Please select a valid size and colour')
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId') || ''
    if (!positiveId(userId)) return notify('Please sign in to add products to your bag')
    try {
      const response = await fetch(`${API_BASE}/api/cart/tarascart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: String(userId), product_id: item.variant_id, selected_size: item.selectedSize, selected_color: item.selectedColor, quantity }) })
      if (!response.ok) throw new Error()
      addToCart(item)
      navigate(destination)
    } catch { notify('Unable to add this product to your bag') }
  }
  const addWish = async () => {
    const item = itemPayload()
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId') || ''
    if (!positiveId(userId)) return notify('Please sign in to save products')
    try {
      const response = await fetch(`${API_BASE}/api/wishlist`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: String(userId), product_id: item.product_id, ean_code: item.ean_code || '', image_url: item.image_url || '', color: item.selectedColor || '' }) })
      if (!response.ok) throw new Error()
      addToWishlist(item)
      notify('Added to your wishlist')
    } catch { notify('Unable to add this product to your wishlist') }
  }
  const shareProduct = async () => {
    try {
      if (navigator.share) await navigator.share({ title: productName, url: window.location.href })
      else { await navigator.clipboard.writeText(window.location.href); notify('Product link copied') }
    } catch {}
  }

  if (loading) return <main className="tkpd-state"><span className="tkpd-spinner" /><p>Loading product...</p></main>
  if (error || !selected) return <main className="tkpd-state"><h1>{error || 'Product not found'}</h1><p>The product may have been removed or the link is no longer available.</p><button type="button" onClick={() => navigate('/')}>Continue shopping</button></main>

  return <><main className="tkpd-page"><div className="tkpd-shell"><button type="button" className="tkpd-back" onClick={() => navigate(-1)}><FiChevronLeft /> Back</button><div className="tkpd-layout"><section className="tkpd-gallery"><div className="tkpd-thumbs">{galleryImages.slice(0, 6).map((image, index) => <button type="button" key={`${image}-${index}`} className={image === mainImage ? 'tkpd-thumb tkpd-thumb-active' : 'tkpd-thumb'} onClick={() => setActiveImage(image)}><img src={image} alt={`${productName} view ${index + 1}`} /></button>)}</div><div className="tkpd-main"><SafeImage sources={unique([mainImage, ...galleryImages])} alt={productName} className="tkpd-main-img" /><div className="tkpd-floating"><button type="button" onClick={shareProduct} aria-label="Share product"><FiShare2 /></button><button type="button" onClick={addWish} aria-label="Add to wishlist"><FiHeart /></button></div></div></section><section className="tkpd-info"><h1>{productName}</h1><p className="tkpd-brand">{clean(selected?.brand || selected?.brand_name)}</p><span className="tkpd-gender">{clean(selected?.gender)}</span><p className="tkpd-path">{[selected?.gender, selected?.category_name, selected?.fit_type || selected?.fit].map(clean).filter(Boolean).join(' › ')}</p><div className="tkpd-price-row"><strong>₹{money(pricing.price)}</strong>{pricing.mrp > pricing.price && <del>₹{money(pricing.mrp)}</del>}{pricing.discount > 0 && <span>{pricing.discount}% OFF</span>}</div><p className="tkpd-name-line">{productName}</p>{colourGroups.length > 0 && <div className="tkpd-option"><div className="tkpd-option-heading"><strong>COLOR</strong><span>{selectedColour}</span></div><div className="tkpd-colour-strip"><button type="button" className="tkpd-strip-arrow"><FiChevronLeft /></button><div className="tkpd-colour-scroll">{colourGroups.map(group => <button type="button" key={group.colour} className={group.colour === selectedColour ? 'tkpd-colour-card tkpd-colour-active' : 'tkpd-colour-card'} onClick={() => chooseColour(group.colour)}><span><SafeImage sources={unique([...group.images, fallbackFor(selected?.gender)])} alt={group.colour} /></span><small>{group.colour}</small></button>)}</div><button type="button" className="tkpd-strip-arrow"><FiChevronRight /></button></div></div>}{sizes.length > 0 && <div className="tkpd-option tkpd-size-option"><div className="tkpd-option-heading"><strong>SIZE</strong></div><div className="tkpd-size-list">{sizes.map(size => <button type="button" key={size} className={size === clean(selected?.size) ? 'tkpd-size tkpd-size-active' : 'tkpd-size'} onClick={() => chooseSize(size)}>{size}</button>)}</div></div>}{stock > 0 && stock <= 5 && <p className="tkpd-stock">Hurry up! Last {stock} {stock === 1 ? 'stock' : 'stocks'} left</p>}<div className="tkpd-quantity"><button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))}><FiMinus /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity(value => Math.min(20, value + 1))}><FiPlus /></button></div><div className="tkpd-actions"><button type="button" className="tkpd-cart" onClick={() => addBag('/cart')}><FiShoppingBag /> ADD TO CART</button><button type="button" className="tkpd-buy" onClick={() => addBag('/order/checkout')}>BUY NOW</button></div><div className="tkpd-service"><p><FiPackage /><span>Estimated Delivery: 4 TO 6 DAYS</span></p><p><FiHelpCircle /><span>Ask a Question</span></p></div></section></div></div>{message && <div className="tkpd-toast">{message}</div>}</main><Footer /></>
}
