import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiHeart } from 'react-icons/fi'
import Footer from './Footer'
import useProductWishlist from '../hooks/useProductWishlist'
import './GenderStorefront.css'
import { useWishlist } from '../WishlistContext'
import CollectionPage from '../components/CollectionPage'
import { apiRequest } from '../services/api'
import { displayBrand } from '../services/brands'

const CLOUD = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_CLOUDINARY_CLOUD) || 'deymt9uyh'
const GENDER_META = {
  MEN: { path: 'men', title: 'Men', fallback: '/images/defaults/attach-men.svg', heroes: ['/images/mens-bg1.jpg', '/images/mens-part1.jpg', '/images/mens-part2.jpg'] },
  WOMEN: { path: 'women', title: 'Women', fallback: '/images/defaults/attach-women.svg', heroes: ['/images/women/women20.jpeg', '/images/updated/grid1.jpg', '/images/women/new/category-2.png'] },
  KIDS: { path: 'kids', title: 'Kids', fallback: '/images/defaults/attach-kids.svg', heroes: ['/images/kids/kids-girls-frock.jpg', '/images/coming-soon.jpg', '/images/mens-part2.jpg'] }
}
const clean = value => String(value || '').trim()
const normalize = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '')
const unique = values => [...new Set(values.map(clean).filter(Boolean))]
const number = value => Number.isFinite(Number(value)) ? Number(value) : 0
const positiveId = value => Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null
const money = value => number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })
const fallbackFor = gender => GENDER_META[gender]?.fallback || '/images/placeholder.jpg'
const MEN_EXCLUDED = /bra|panty|brief|slip|camisole|chudidar|lehenga|kurti|saree|legging|jegging|palazzo|nightwear/i
const belongsToGender = (item, gender) => {
  const itemGender = clean(item?.root_name || item?.gender).toUpperCase()
  if (itemGender && itemGender !== gender) return false
  if (gender === 'MEN' && MEN_EXCLUDED.test(clean(item?.category_name || item?.name || item?.product_name))) return false
  return true
}
const explicitImages = product => unique([product?.shared_image_url, product?.front_image_url, product?.back_image_url, product?.main_image_url, product?.variant_image_url, product?.ean_image_url, product?.image_url, ...(Array.isArray(product?.images) ? product.images : [])])
const imageCandidates = (product, gender) => {
  const ean = clean(product?.ean_code)
  const images = explicitImages(product)
  return unique([...images, images.length ? '' : ean ? `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto/products/${encodeURIComponent(ean)}` : '', fallbackFor(gender)])
}
const priceFor = (product, userType) => {
  const b2b = clean(userType).toUpperCase() === 'B2B'
  const mrp = number(b2b ? product?.original_price_b2b || product?.mrp : product?.original_price_b2c || product?.mrp)
  const price = number(b2b ? product?.final_price_b2b || product?.sale_price : product?.final_price_b2c || product?.sale_price) || mrp
  return { mrp, price, discount: mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0 }
}
const designKeyFor = row => row.style_key || [normalize(row.brand||row.brand_name),normalize(row.product_name||row.name),normalize(row.gender),row.category_id,normalize(row.pattern_code),normalize(row.fit||row.fit_type),row.pack_size||1].join('|')
const groupProducts = rows => {
  const groups = new Map()
  ;(Array.isArray(rows) ? rows : []).forEach(row => {
    const id = positiveId(row?.product_id || row?.id)
    if (!id) return
    const designKey = designKeyFor(row)
    if (!groups.has(designKey)) groups.set(designKey, { ...row, product_id: id, design_key: designKey, product_ids: [], variants: [], images: [], colours: [], sizes: [] })
    const group = groups.get(designKey)
    group.product_ids = unique([...group.product_ids, id])
    group.variants.push(row)
    group.images = unique([...group.images, ...explicitImages(row)])
    group.colours = unique([...group.colours, row?.colour, row?.color])
    group.sizes = unique([...group.sizes, row?.size])
    if (number(row?.id) > number(group?.id)) group.id = row.id
  })
  return [...groups.values()]
}
const categoriesFrom = (payload, gender) => {
  const rows = Array.isArray(payload) ? payload : payload?.categories || []
  return rows.filter(category => belongsToGender(category, gender) && Number(category?.level) > 0).sort((a, b) => number(a.sort_order) - number(b.sort_order) || number(b.product_count) - number(a.product_count))
}

function SafeImage({ product, gender, alt, className }) {
  const sources = imageCandidates(product, gender)
  const key = sources.join('|')
  const [index, setIndex] = useState(0)
  useEffect(() => setIndex(0), [key])
  return <img className={className} src={sources[Math.min(index, sources.length - 1)]} alt={alt} loading="lazy" onError={() => setIndex(current => Math.min(current + 1, sources.length - 1))} />
}

const rememberPosition = location => {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('attach:return-position', JSON.stringify({ url: `${location.pathname}${location.search}`, y: window.scrollY, time: Date.now() }))
}

function useRestorePosition(ready) {
  const location = useLocation()
  useEffect(() => {
    if (!ready || typeof window === 'undefined') return undefined
    let saved
    try { saved = JSON.parse(sessionStorage.getItem('attach:return-position') || 'null') } catch { saved = null }
    if (!saved || saved.url !== `${location.pathname}${location.search}` || Date.now() - Number(saved.time || 0) > 1800000) return undefined
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    const restore = () => window.scrollTo({ top: Number(saved.y || 0), behavior: 'auto' })
    const timers = [0, 100, 300, 700, 1200, 1800].map(delay => window.setTimeout(restore, delay))
    const clearTimer = window.setTimeout(() => sessionStorage.removeItem('attach:return-position'), 2200)
    return () => { timers.forEach(window.clearTimeout); window.clearTimeout(clearTimer); window.history.scrollRestoration = previousRestoration }
  }, [ready, location.pathname, location.search])
}

function SectionTitle({ children, controls, compact }) {
  return <div className={compact ? 'tgs-heading tgs-heading-compact' : 'tgs-heading'}><h2>{children}<i /></h2>{controls}</div>
}

function ProductCard({ product, gender, userType, onOpen, onWish }) {
  const { save, saved, pending, message } = useProductWishlist(product)
  const pricing = priceFor(product, userType)
  const name = clean(product?.product_name || product?.name || 'Product')
  return <article className="tgs-product"><button type="button" className="tgs-product-image" onClick={() => onOpen(product)}><SafeImage product={product} gender={gender} alt={name} />{pricing.discount > 0 && <span className="tgs-sale">SALE</span>}</button><button type="button" className="tgs-heart" onClick={event => { event.stopPropagation(); save() }} disabled={pending} aria-pressed={saved} aria-label={saved ? "Saved to wishlist" : "Add to wishlist"}><FiHeart fill={saved ? "currentColor" : "none"} /></button><button type="button" className="tgs-product-copy" onClick={() => onOpen(product)}><small>{displayBrand(product?.brand || product?.brand_name)}</small><strong>{name}</strong><span className="tgs-card-price">₹{money(pricing.price)}{pricing.mrp > pricing.price && <del>₹{money(pricing.mrp)}</del>}{pricing.discount > 0 && <em>{pricing.discount}% OFF</em>}</span></button>{message && <small role="status">{message}</small>}</article>
}

function ProductRail({ title, products, gender, userType, onOpen, onWish }) {
  const rail = useRef(null)
  const scroll = direction => rail.current?.scrollBy({ left: direction * Math.max(320, rail.current.clientWidth * .78), behavior: 'smooth' })
  if (!products.length) return null
  return <section className="tgs-section"><SectionTitle controls={<div className="tgs-round-controls"><button type="button" onClick={() => scroll(-1)}><FiChevronLeft /></button><button type="button" onClick={() => scroll(1)}><FiChevronRight /></button></div>}>{title}</SectionTitle><div className="tgs-product-rail" ref={rail}>{products.map(product => <ProductCard key={product.design_key || product.product_id} product={product} gender={gender} userType={userType} onOpen={onOpen} onWish={onWish} />)}</div></section>
}

function HeroCarousel({ gender }) {
  const meta = GENDER_META[gender]
  const [slide, setSlide] = useState(0)
  useEffect(() => { const timer = window.setInterval(() => setSlide(value => (value + 1) % meta.heroes.length), 4500); return () => window.clearInterval(timer) }, [meta.heroes.length])
  const slides = [...meta.heroes, ...meta.heroes]
  return <section className="tgs-hero"><div className="tgs-hero-track" style={{ '--tgs-slide': slide }}>{slides.map((image, index) => <div className="tgs-hero-slide" key={`${gender}-${image}-${index}`}><img src={image} alt={`${meta.title} collection ${(index % meta.heroes.length) + 1}`} /><div className="tgs-hero-copy"><small>ATTACH COLLECTION</small><h1>{meta.title.toUpperCase()}</h1><p>Everyday style, selected for you.</p></div></div>)}</div><div className="tgs-dots">{meta.heroes.map((image, index) => <button type="button" key={image} className={index === slide ? 'is-active' : ''} onClick={() => setSlide(index)} aria-label={`Show slide ${index + 1}`} />)}</div></section>
}

function useStorefrontData(gender) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [productPayload, categoryPayload] = await Promise.all([apiRequest(`/api/products/catalogue?gender=${gender}&limit=36`, {signal:controller.signal}),apiRequest(`/api/products/facets?gender=${gender}`,{signal:controller.signal})]);
        const productRows = Array.isArray(productPayload) ? productPayload : productPayload?.products || []
        const groupedProducts = groupProducts(productRows.filter(product => belongsToGender(product, gender)))
        setProducts(groupedProducts)
        setCategories(categoriesFrom(categoryPayload, gender).filter(category => Number(category.level) === 1))
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError?.message || 'Unable to load products')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [gender])
  return { products, categories, loading, error }
}

export function GenderLandingPage({ gender }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToWishlist } = useWishlist()
  const { products, categories, loading, error } = useStorefrontData(gender)
  const meta = GENDER_META[gender]
  const userType = typeof window === 'undefined' ? 'B2C' : sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C'
  useRestorePosition(!loading && !error)
  const openProduct = product => { const id = positiveId(product?.variants?.[0]?.id || product?.id); if (id) { rememberPosition(location); navigate(`/product/${id}`) } }
  const openCategory = category => navigate(`/shop/${meta.path}/${category.slug}`)
  const addWish = product => { addToWishlist(product); window.dispatchEvent(new Event('wishlist-updated')) }
  const categoryProducts = category => products.filter(product => Number(product?.category_id) === Number(category.id)).slice(0, 10)
  return <><main className="tgs-page"><HeroCarousel gender={gender} />{loading ? <div className="tgs-state"><span className="tgs-spinner" /><p>Loading collections...</p></div> : error ? <div className="tgs-state"><h2>{error}</h2><button type="button" onClick={() => window.location.reload()}>Try again</button></div> : <><section className="tgs-section tgs-categories"><SectionTitle>SHOP BY CATEGORY</SectionTitle><div className="tgs-category-grid">{categories.map(category => <button type="button" className="tgs-category" key={category.id} onClick={() => openCategory(category)}><img src={category.representative_image || categoryProducts(category)[0]?.images?.[0] || meta.fallback} alt={category.name} onError={event => { event.currentTarget.src = meta.fallback }} /><span><strong>{category.name}</strong><i><FiChevronRight /></i></span></button>)}</div></section><ProductRail title="NEW DROPS" products={[...products].sort((a, b) => number(b.id) - number(a.id)).slice(0, 14)} gender={gender} userType={userType} onOpen={openProduct} onWish={addWish} />{categories.filter(category => categoryProducts(category).length > 0).map(category => <ProductRail key={category.id} title={category.name.toUpperCase()} products={categoryProducts(category)} gender={gender} userType={userType} onOpen={openProduct} onWish={addWish} />)}<section className="tgs-section"><button className="tgs-browse-all" onClick={()=>navigate(`/category-display?gender=${gender}`)}>View all {meta.title.toLowerCase()} products</button></section></>}</main><Footer /></>
}

export function CategoryProductsPage() {
  const {gender,categorySlug}=useParams()
  return <><CollectionPage gender={clean(gender).toUpperCase()} initialCategorySlug={categorySlug} /><Footer /></>
}
