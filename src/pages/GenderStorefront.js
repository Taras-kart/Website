import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiHeart, FiSliders, FiX } from 'react-icons/fi'
import Footer from './Footer'
import './GenderStorefront.css'
import { useWishlist } from '../WishlistContext'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE = ((typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) || DEFAULT_API_BASE).replace(/\/+$/, '')
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
const designKeyFor = row => {
  const base = [normalize(row?.brand || row?.brand_name), normalize(row?.product_name || row?.name), normalize(row?.category_name || row?.category), normalize(row?.category_path)].filter(Boolean).join('|')
  const design = clean(row?.design_code || row?.pattern_code || row?.style_code || row?.mark_code || row?.model_code)
  if (design) return `${base}|design:${normalize(design)}`
  const colour = normalize(row?.color || row?.colour) || 'default'
  return `${base}|legacy:${colour}`
}
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
  const pricing = priceFor(product, userType)
  const name = clean(product?.product_name || product?.name || 'Product')
  return <article className="tgs-product"><button type="button" className="tgs-product-image" onClick={() => onOpen(product)}><SafeImage product={product} gender={gender} alt={name} />{pricing.discount > 0 && <span className="tgs-sale">SALE</span>}</button><button type="button" className="tgs-heart" onClick={event => { event.stopPropagation(); onWish(product) }} aria-label="Add to wishlist"><FiHeart /></button><button type="button" className="tgs-product-copy" onClick={() => onOpen(product)}><small>{clean(product?.brand || product?.brand_name)}</small><strong>{name}</strong><span className="tgs-card-price">₹{money(pricing.price)}{pricing.mrp > pricing.price && <del>₹{money(pricing.mrp)}</del>}{pricing.discount > 0 && <em>{pricing.discount}% OFF</em>}</span></button></article>
}

function ProductRail({ title, products, gender, userType, onOpen, onWish }) {
  const rail = useRef(null)
  const scroll = direction => rail.current?.scrollBy({ left: direction * Math.max(320, rail.current.clientWidth * .78), behavior: 'smooth' })
  if (!products.length) return null
  return <section className="tgs-section"><SectionTitle controls={<div className="tgs-round-controls"><button type="button" onClick={() => scroll(-1)}><FiChevronLeft /></button><button type="button" onClick={() => scroll(1)}><FiChevronRight /></button></div>}>{title}</SectionTitle><div className="tgs-product-rail" ref={rail}>{products.map(product => <ProductCard key={product.design_key || product.product_id} product={product} gender={gender} userType={userType} onOpen={onOpen} onWish={onWish} />)}</div></section>
}

function AllProductsSection({ products, categories, gender, userType, onOpen, onWish }) {
  const storageKey = `attach:all-products:${gender}`
  const savedState = () => {
    if (typeof window === 'undefined') return { categoryId: 'all', visible: 20 }
    try { return JSON.parse(sessionStorage.getItem(storageKey) || 'null') || { categoryId: 'all', visible: 20 } } catch { return { categoryId: 'all', visible: 20 } }
  }
  const [categoryId, setCategoryId] = useState(() => savedState().categoryId || 'all')
  const [visible, setVisible] = useState(() => number(savedState().visible) || 20)
  const selectedProducts = useMemo(() => categoryId === 'all' ? products : products.filter(product => Number(product.category_id) === Number(categoryId)), [products, categoryId])
  useEffect(() => { sessionStorage.setItem(storageKey, JSON.stringify({ categoryId, visible })) }, [storageKey, categoryId, visible])
  const selectCategory = value => { setCategoryId(value); setVisible(20) }
  return <section className="tgs-section tgs-all-products"><SectionTitle>ALL PRODUCTS</SectionTitle><div className="tgs-category-pills"><button type="button" className={categoryId === 'all' ? 'is-active' : ''} onClick={() => selectCategory('all')}>ALL</button>{categories.map(category => <button type="button" key={category.id} className={Number(categoryId) === Number(category.id) ? 'is-active' : ''} onClick={() => selectCategory(category.id)}>{category.name}</button>)}</div><div className="tgs-all-grid">{selectedProducts.slice(0, visible).map(product => <ProductCard key={product.design_key || product.product_id} product={product} gender={gender} userType={userType} onOpen={onOpen} onWish={onWish} />)}</div>{visible < selectedProducts.length && <div className="tgs-load-more"><button type="button" onClick={() => setVisible(current => current + 20)}>VIEW MORE</button></div>}</section>
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
        const [productResponse, categoryResponse] = await Promise.all([fetch(`${API_BASE}/api/products?gender=${gender}&limit=50000`, { signal: controller.signal, cache: 'no-store' }), fetch(`${API_BASE}/api/categories?active=true&withCounts=true`, { signal: controller.signal, cache: 'no-store' })])
        if (!productResponse.ok) throw new Error('Unable to load products')
        const productPayload = await productResponse.json()
        const categoryPayload = categoryResponse.ok ? await categoryResponse.json() : { categories: [] }
        const productRows = Array.isArray(productPayload) ? productPayload : productPayload?.products || []
        const groupedProducts = groupProducts(productRows.filter(product => belongsToGender(product, gender)))
        const populatedCategoryIds = new Set(groupedProducts.map(product => Number(product?.category_id)).filter(Boolean))
        setProducts(groupedProducts)
        setCategories(categoriesFrom(categoryPayload, gender).filter(category => populatedCategoryIds.has(Number(category.id))))
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
  return <><main className="tgs-page"><HeroCarousel gender={gender} />{loading ? <div className="tgs-state"><span className="tgs-spinner" /><p>Loading collections...</p></div> : error ? <div className="tgs-state"><h2>{error}</h2><button type="button" onClick={() => window.location.reload()}>Try again</button></div> : <><section className="tgs-section tgs-categories"><SectionTitle>SHOP BY CATEGORY</SectionTitle><div className="tgs-category-grid">{categories.map(category => <button type="button" className="tgs-category" key={category.id} onClick={() => openCategory(category)}><img src={category.representative_image || categoryProducts(category)[0]?.images?.[0] || meta.fallback} alt={category.name} onError={event => { event.currentTarget.src = meta.fallback }} /><span><strong>{category.name}</strong><i><FiChevronRight /></i></span></button>)}</div></section><ProductRail title="NEW DROPS" products={[...products].sort((a, b) => number(b.id) - number(a.id)).slice(0, 14)} gender={gender} userType={userType} onOpen={openProduct} onWish={addWish} />{categories.filter(category => categoryProducts(category).length > 0).map(category => <ProductRail key={category.id} title={category.name.toUpperCase()} products={categoryProducts(category)} gender={gender} userType={userType} onOpen={openProduct} onWish={addWish} />)}<AllProductsSection products={products} categories={categories} gender={gender} userType={userType} onOpen={openProduct} onWish={addWish} /></>}</main><Footer /></>
}

export function CategoryProductsPage() {
  const { gender: genderPath, categorySlug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { addToWishlist } = useWishlist()
  const gender = clean(genderPath).toUpperCase()
  const safeGender = GENDER_META[gender] ? gender : 'WOMEN'
  const meta = GENDER_META[safeGender]
  const { products, categories, loading, error } = useStorefrontData(safeGender)
  const listingStorageKey = `attach:listing:${location.pathname}`
  const savedListing = () => {
    if (typeof window === 'undefined') return {}
    try { return JSON.parse(sessionStorage.getItem(listingStorageKey) || 'null') || {} } catch { return {} }
  }
  const initialListing = useRef(savedListing())
  const [sort, setSort] = useState(() => initialListing.current.sort || 'popular')
  const [brands, setBrands] = useState(() => Array.isArray(initialListing.current.brands) ? initialListing.current.brands : [])
  const [categoryIds, setCategoryIds] = useState(() => Array.isArray(initialListing.current.categoryIds) ? initialListing.current.categoryIds.map(Number) : [])
  const [mobileFilters, setMobileFilters] = useState(false)
  const category = categories.find(item => clean(item.slug) === clean(categorySlug))
  useEffect(() => {
    if (category?.id && !Object.keys(initialListing.current).length) setCategoryIds([Number(category.id)])
  }, [category?.id, listingStorageKey])
  useEffect(() => { sessionStorage.setItem(listingStorageKey, JSON.stringify({ sort, brands, categoryIds })) }, [listingStorageKey, sort, brands, categoryIds])
  const availableBrands = useMemo(() => unique(products.filter(product => !categoryIds.length || categoryIds.includes(Number(product.category_id))).map(product => product.brand || product.brand_name)).sort(), [products, categoryIds])
  const filtered = useMemo(() => {
    let result = products.filter(product => !categoryIds.length || categoryIds.includes(Number(product.category_id)))
    if (brands.length) result = result.filter(product => brands.includes(clean(product.brand || product.brand_name)))
    if (sort === 'low') result = [...result].sort((a, b) => priceFor(a, 'B2C').price - priceFor(b, 'B2C').price)
    else if (sort === 'high') result = [...result].sort((a, b) => priceFor(b, 'B2C').price - priceFor(a, 'B2C').price)
    else if (sort === 'new') result = [...result].sort((a, b) => number(b.id) - number(a.id))
    return result
  }, [products, categoryIds, brands, sort])
  useRestorePosition(!loading && !error)
  const openProduct = product => { const id = positiveId(product?.variants?.[0]?.id || product?.id); if (id) { rememberPosition(location); navigate(`/product/${id}`) } }
  const toggleBrand = brand => setBrands(current => current.includes(brand) ? current.filter(item => item !== brand) : [...current, brand])
  const toggleCategory = categoryId => setCategoryIds(current => current.includes(Number(categoryId)) ? current.filter(id => id !== Number(categoryId)) : [...current, Number(categoryId)])
  const clearFilters = () => { setCategoryIds([]); setBrands([]) }
  const selectedCount = categoryIds.length + brands.length
  const sidebar = <aside className="tgs-filter"><div className="tgs-filter-head"><strong>FILTERS {selectedCount ? `(${selectedCount})` : ''}</strong><button type="button" onClick={clearFilters}>Clear All</button></div><div className="tgs-filter-block"><h3>GENDER</h3><div className="tgs-filter-choice is-active is-locked"><i />{meta.title}</div></div><div className="tgs-filter-block"><h3>CATEGORY</h3>{categories.map(item => <button type="button" key={item.id} className={categoryIds.includes(Number(item.id)) ? 'is-active' : ''} onClick={() => toggleCategory(item.id)}><i />{item.name}</button>)}</div>{availableBrands.length > 0 && <div className="tgs-filter-block"><h3>BRAND</h3>{availableBrands.map(brand => <button type="button" key={brand} className={brands.includes(brand) ? 'is-active' : ''} onClick={() => toggleBrand(brand)}><i />{brand}</button>)}</div>}</aside>
  return <><main className="tgs-page tgs-listing"><header className="tgs-listing-head"><div><p>{meta.title.toUpperCase()}</p><h1>{categoryIds.length === 1 ? categories.find(item => Number(item.id) === categoryIds[0])?.name || category?.name : `${meta.title} Collection`}</h1></div><label>Sort by:<select value={sort} onChange={event => setSort(event.target.value)}><option value="popular">Popularity</option><option value="new">Newest</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option></select><FiChevronDown /></label><button type="button" className="tgs-mobile-filter" onClick={() => setMobileFilters(true)}><FiSliders /> Filters</button></header>{loading ? <div className="tgs-state"><span className="tgs-spinner" /></div> : error ? <div className="tgs-state"><h2>{error}</h2></div> : <div className="tgs-listing-layout">{sidebar}<section className="tgs-grid">{filtered.map(product => <ProductCard key={product.design_key || product.product_id} product={product} gender={safeGender} userType="B2C" onOpen={openProduct} onWish={addToWishlist} />)}</section></div>}{mobileFilters && <div className="tgs-filter-modal"><button type="button" className="tgs-filter-backdrop" onClick={() => setMobileFilters(false)} /><div className="tgs-filter-drawer"><button type="button" className="tgs-filter-close" onClick={() => setMobileFilters(false)}><FiX /></button>{sidebar}</div></div>}</main><Footer /></>
}
