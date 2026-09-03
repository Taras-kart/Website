import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiHeart, FiMenu, FiSearch, FiShoppingCart, FiUser, FiX } from 'react-icons/fi'
import './Navbar.css'
import { useWishlist } from '../WishlistContext'
import { useCart } from '../CartContext'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE = ((typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) || DEFAULT_API_BASE).replace(/\/+$/, '')
const CLOUD = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_CLOUDINARY_CLOUD) || 'deymt9uyh'
const RECENT_KEY = 'tara_recently_viewed_products'
const FALLBACKS = { WOMEN: '/images/defaults/attach-women.svg', MEN: '/images/defaults/attach-men.svg', KIDS: '/images/defaults/attach-kids.svg', DEFAULT: '/images/placeholder.jpg' }

const clean = value => String(value || '').trim()
const normalize = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
const unique = values => [...new Set(values.map(clean).filter(Boolean))]
const tokensOf = value => normalize(value).split(' ').filter(Boolean)
const productText = product => normalize([product?.product_name, product?.name, product?.brand, product?.brand_name, product?.category_name, product?.category, product?.category_slug, product?.pattern_code, product?.fit_type, product?.fit, product?.color, product?.colour, product?.gender].filter(Boolean).join(' '))
const matchesQuery = (product, query) => tokensOf(query).every(token => productText(product).includes(token))

const imageCandidates = product => {
  const ean = clean(product?.ean_code)
  return unique([product?.shared_image_url, product?.variant_image_url, product?.ean_image_url, product?.image_url, ...(Array.isArray(product?.images) ? product.images : []), ean ? `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto/products/${encodeURIComponent(ean)}` : ''])
}

const groupProducts = rows => {
  const groups = new Map()
  ;(Array.isArray(rows) ? rows : []).forEach(row => {
    const productId = Number(row?.product_id || row?.id || 0)
    if (!productId) return
    const base = [normalize(row?.brand || row?.brand_name), normalize(row?.product_name || row?.name), normalize(row?.category_name || row?.category)]
    const design = normalize(row?.design_code || row?.pattern_code || row?.style_code || row?.mark_code || row?.model_code)
    const colour = normalize(row?.color || row?.colour) || 'default'
    const key = `${base.join('|')}|${design ? `design:${design}` : `legacy:${colour}`}`
    if (!groups.has(key)) groups.set(key, { ...row, id: productId, product_id: productId, variants: [], images: [] })
    const group = groups.get(key)
    group.variants.push(row)
    group.images = unique([...group.images, ...imageCandidates(row)])
  })
  return [...groups.values()]
}

const priceFor = (product, userType) => {
  const offers = userType === 'B2B' ? [product?.final_price_b2b, product?.sale_price, product?.mrp, product?.original_price_b2b] : [product?.final_price_b2c, product?.sale_price, product?.mrp, product?.original_price_b2c]
  const originals = userType === 'B2B' ? [product?.original_price_b2b, product?.mrp, product?.final_price_b2b] : [product?.original_price_b2c, product?.mrp, product?.final_price_b2c]
  const offer = offers.map(Number).find(value => Number.isFinite(value) && value > 0) || 0
  const original = originals.map(Number).find(value => Number.isFinite(value) && value > 0) || offer
  const discount = original > offer && offer > 0 ? Math.round(((original - offer) / original) * 100) : 0
  return { offer, original, discount }
}

const money = value => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: Number(value || 0) % 1 ? 2 : 0, maximumFractionDigits: 2 })

function SearchImage({ product }) {
  const fallback = FALLBACKS[clean(product?.gender).toUpperCase()] || FALLBACKS.DEFAULT
  const sourceKey = unique([...(product?.images || []), fallback]).join('|')
  const sources = useMemo(() => sourceKey.split('|').filter(Boolean), [sourceKey])
  const [index, setIndex] = useState(0)
  useEffect(() => setIndex(0), [sourceKey])
  return <img src={sources[Math.min(index, sources.length - 1)]} alt={clean(product?.product_name || product?.name || 'Product')} onError={() => setIndex(current => Math.min(current + 1, sources.length - 1))} />
}

function SearchPopup({ open, onClose, userType }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const abortRef = useRef(null)
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLabel, setInitialLabel] = useState('Recently viewed')

  useEffect(() => {
    if (!open) return undefined
    setQuery('')
    setSuggestions([])
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80)
    let recent = []
    try { recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { recent = [] }
    if (Array.isArray(recent) && recent.length) {
      setProducts(recent.slice(0, 4))
      setInitialLabel('Recently viewed')
    } else {
      setInitialLabel('Popular right now')
      fetch(`${API_BASE}/api/products?limit=24&hasImage=true`, { cache: 'no-store' })
        .then(response => response.ok ? response.json() : [])
        .then(data => setProducts(groupProducts(Array.isArray(data) ? data : data?.products || []).slice(0, 4)))
        .catch(() => setProducts([]))
    }
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const value = clean(query)
    if (value.length < 2) {
      setSuggestions([])
      setLoading(false)
      return undefined
    }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const encoded = encodeURIComponent(value)
        const [productResponse, suggestionResponse] = await Promise.all([
          fetch(`${API_BASE}/api/products/search?q=${encoded}`, { signal: controller.signal, cache: 'no-store' }),
          fetch(`${API_BASE}/api/products/suggest?q=${encoded}`, { signal: controller.signal, cache: 'no-store' })
        ])
        const productData = productResponse.ok ? await productResponse.json() : []
        const suggestionData = suggestionResponse.ok ? await suggestionResponse.json() : []
        setProducts(groupProducts(Array.isArray(productData) ? productData : productData?.products || []).filter(product => matchesQuery(product, value)).slice(0, 4))
        setSuggestions(unique(Array.isArray(suggestionData) ? suggestionData : []).slice(0, 6))
      } catch {
        if (!controller.signal.aborted) { setProducts([]); setSuggestions([]) }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 180)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [open, query])

  useEffect(() => {
    document.body.classList.toggle('tara-search-open', open)
    return () => document.body.classList.remove('tara-search-open')
  }, [open])

  if (!open) return null

  const openProduct = product => {
    const selected = product?.variants?.[0] || product
    const variantId = Number(selected?.variant_id || selected?.id || 0)
    if (!variantId) return
    try {
      const current = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
      const next = [product, ...(Array.isArray(current) ? current : []).filter(item => Number(item?.product_id || item?.id) !== Number(product?.product_id || product?.id))].slice(0, 8)
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {}
    onClose()
    navigate(`/product/${variantId}`)
  }

  const viewAll = () => {
    const value = clean(query)
    if (!value) return
    onClose()
    navigate(`/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <div className="tara-search-overlay" role="dialog" aria-modal="true" aria-label="Product search">
      <button type="button" className="tara-search-overlay__backdrop" aria-label="Close search" onClick={onClose} />
      <section className="tara-search-modal">
        <div className="tara-search-modal__top">
          <FiSearch />
          <input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') viewAll(); if (event.key === 'Escape') onClose() }} placeholder="Search products, colours or patterns..." autoComplete="off" spellCheck={false} />
          {query && <button type="button" className="tara-search-modal__clear" aria-label="Clear search" onClick={() => setQuery('')}><FiX /></button>}
          <button type="button" className="tara-search-modal__close" aria-label="Close search" onClick={onClose}><FiX /></button>
        </div>

        {query.length >= 2 && suggestions.length > 0 && <div className="tara-search-modal__suggestions">{suggestions.map(suggestion => <button type="button" key={suggestion} onClick={() => setQuery(suggestion)}>{suggestion}</button>)}</div>}

        <div className="tara-search-modal__content">
          <h2>{query.length >= 2 ? 'Search results' : initialLabel}</h2>
          {loading ? <div className="tara-search-modal__grid">{[1, 2, 3, 4].map(item => <div className="tara-search-card tara-search-card--loading" key={item} />)}</div> : products.length ? (
            <div className="tara-search-modal__grid">{products.map(product => {
              const price = priceFor(product, userType)
              return <button type="button" className="tara-search-card" key={product.product_id || product.id} onClick={() => openProduct(product)}><div className="tara-search-card__image"><SearchImage product={product} /></div><span className="tara-search-card__brand">{clean(product.brand || product.brand_name)}</span><strong>{clean(product.product_name || product.name)}</strong>{price.offer > 0 && <div className="tara-search-card__price"><b>₹{money(price.offer)}</b>{price.original > price.offer && <del>₹{money(price.original)}</del>}{price.discount > 0 && <em>{price.discount}% OFF</em>}</div>}</button>
            })}</div>
          ) : <div className="tara-search-modal__empty"><FiSearch /><strong>No matching products</strong><span>Try another product, colour, brand or category.</span></div>}
        </div>
        {query.length >= 2 && products.length > 0 && <button type="button" className="tara-search-modal__view-all" onClick={viewAll}>View all products</button>}
      </section>
    </div>
  )
}

export default function NavbarFinal() {
  const { wishlistItems = [] } = useWishlist()
  const { cartItems = [] } = useCart()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userType, setUserType] = useState(() => typeof window === 'undefined' ? 'B2C' : sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C')
  const isB2B = String(userType).toUpperCase() === 'B2B'
  const homePath = isB2B ? '/b2b-dashboard' : '/'
  const navLinks = useMemo(() => isB2B ? [{ name: 'Dashboard', path: '/b2b-dashboard' }, { name: 'Products', path: '/b2b-products' }, { name: 'Contact Us', path: '/customer-care' }] : [{ name: 'Women', path: '/women' }, { name: 'Men', path: '/men' }, { name: 'Kids', path: '/kids' }, { name: 'Brands', path: '/brands' }, { name: 'Contact Us', path: '/customer-care' }], [isB2B])

  useEffect(() => {
    const sync = () => setUserType(sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C')
    window.addEventListener('storage', sync)
    const interval = window.setInterval(sync, 500)
    return () => { window.removeEventListener('storage', sync); window.clearInterval(interval) }
  }, [])
  useEffect(() => { setMobileOpen(false); setSearchOpen(false) }, [location.pathname, location.search])
  useEffect(() => { document.body.classList.toggle('tara-menu-open', mobileOpen); return () => document.body.classList.remove('tara-menu-open') }, [mobileOpen])
  useEffect(() => {
    const close = event => { if (event.key === 'Escape') { setMobileOpen(false); setSearchOpen(false) } }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  const active = path => location.pathname === path
  const closeNavigation = () => { setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return <header className="tara-navbar"><div className="tara-navbar__row"><Link to={homePath} className="tara-navbar__brand" onClick={closeNavigation} aria-label="Attach home"><img src="/logo1.png" alt="Attach" /></Link><nav className="tara-navbar__links" aria-label="Main navigation">{navLinks.map(link => <Link key={link.path} to={link.path} onClick={closeNavigation} className={active(link.path) ? 'is-active' : ''}>{link.name}</Link>)}</nav><div className="tara-navbar__actions">{!isB2B && <button type="button" className="tara-navbar__icon" aria-label="Search" onClick={() => setSearchOpen(true)}><FiSearch /></button>}{!isB2B && <Link to="/wishlist" className={active('/wishlist') ? 'tara-navbar__icon is-active' : 'tara-navbar__icon'} aria-label="Wishlist"><FiHeart />{wishlistItems.length > 0 && <span className="tara-navbar__count">{Math.min(wishlistItems.length, 99)}</span>}</Link>}{!isB2B && <Link to="/cart" className={active('/cart') ? 'tara-navbar__icon is-active' : 'tara-navbar__icon'} aria-label="Cart"><FiShoppingCart />{cartItems.length > 0 && <span className="tara-navbar__count">{Math.min(cartItems.length, 99)}</span>}</Link>}<Link to="/profile" className={active('/profile') ? 'tara-navbar__icon is-active' : 'tara-navbar__icon'} aria-label="Profile"><FiUser /></Link><button type="button" className="tara-navbar__icon tara-navbar__menu-button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(value => !value)}>{mobileOpen ? <FiX /> : <FiMenu />}</button></div></div>{mobileOpen && <div className="tara-mobile-menu"><nav aria-label="Mobile navigation"><Link to={homePath} onClick={closeNavigation} className={active(homePath) ? 'is-active' : ''}>Home</Link>{navLinks.map(link => <Link key={link.path} to={link.path} onClick={closeNavigation} className={active(link.path) ? 'is-active' : ''}>{link.name}</Link>)}</nav></div>}<SearchPopup open={searchOpen} onClose={() => setSearchOpen(false)} userType={String(userType).toUpperCase()} /></header>
}
