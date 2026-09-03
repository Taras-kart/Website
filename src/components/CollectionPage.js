import React, { useEffect, useMemo, useState } from 'react'
import { FiChevronDown, FiFilter, FiSearch, FiX } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import ProductCard from './ProductCard'
import { fetchProducts, getPrice } from '../services/productsApi'
import './CollectionPage.css'

const clean = value => String(value || '').trim()
const lower = value => clean(value).toLowerCase()
const unique = values => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))

function matches(product, query) {
  if (!query) return true
  const words = lower(query).split(/\s+/).filter(Boolean)
  const haystack = lower([product.name, product.brand, product.category, product.gender, product.designKey].join(' '))
  return words.every(word => haystack.includes(word))
}

export default function CollectionPage({ gender = '', title, eyebrow = 'Attach collections', description = '', fixedBrand = '', fixedCategory = '', searchMode = false }) {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draftSearch, setDraftSearch] = useState(params.get('q') || '')
  const brand = fixedBrand || params.get('brand') || ''
  const category = fixedCategory || params.get('category') || ''
  const sort = params.get('sort') || 'featured'
  const min = Number(params.get('min') || 0)
  const max = Number(params.get('max') || 0)
  const query = params.get('q') || ''
  const userType = (sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C').toUpperCase()

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    fetchProducts().then(rows => { if (active) setProducts(rows) }).catch(reason => { if (active) setError(reason.message || 'Unable to load products') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (loading || typeof window === 'undefined') return undefined
    let saved
    try { saved = JSON.parse(sessionStorage.getItem('attach:return-position') || 'null') } catch { saved = null }
    if (!saved || saved.url !== `${location.pathname}${location.search}` || Date.now() - Number(saved.time || 0) > 1800000) return undefined
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    const restore = () => window.scrollTo({ top: Number(saved.y || 0), behavior: 'auto' })
    const timers = [0, 100, 300, 700, 1200, 1800].map(delay => window.setTimeout(restore, delay))
    const clearTimer = window.setTimeout(() => sessionStorage.removeItem('attach:return-position'), 2200)
    return () => { timers.forEach(window.clearTimeout); window.clearTimeout(clearTimer); window.history.scrollRestoration = previousRestoration }
  }, [loading, location.pathname, location.search])

  const scoped = useMemo(() => products.filter(product => !gender || lower(product.gender) === lower(gender)), [products, gender])
  const brands = useMemo(() => unique(scoped.map(product => product.brand)), [scoped])
  const categories = useMemo(() => unique(scoped.filter(product => !brand || lower(product.brand) === lower(brand)).map(product => product.category)), [scoped, brand])
  const visible = useMemo(() => {
    const rows = scoped.filter(product => {
      const price = getPrice(product, userType).final
      return (!brand || lower(product.brand) === lower(brand)) && (!category || lower(product.category) === lower(category)) && (!min || price >= min) && (!max || price <= max) && matches(product, query)
    })
    return [...rows].sort((a, b) => {
      const aPrice = getPrice(a, userType).final
      const bPrice = getPrice(b, userType).final
      if (sort === 'price-low') return aPrice - bPrice
      if (sort === 'price-high') return bPrice - aPrice
      if (sort === 'name') return a.name.localeCompare(b.name)
      return Number(b.available > 0) - Number(a.available > 0)
    })
  }, [scoped, brand, category, min, max, query, sort, userType])

  const update = changes => {
    const next = new URLSearchParams(location.search)
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key))
    navigate(`${location.pathname}${next.toString() ? `?${next}` : ''}`, { replace: false })
  }
  const clear = () => navigate(location.pathname)
  const heading = title || (query ? `Results for “${query}”` : category || brand || `${gender || 'All'} collection`)
  const activeCount = [brand, category, min, max].filter(Boolean).length

  return <main className="tara-collection">
    <section className="tara-collection-hero">
      <div><span>{eyebrow}</span><h1>{heading}</h1><p>{description || 'Explore thoughtfully selected styles, live availability and prices from Attach.'}</p></div>
      <div className="tara-collection-stat"><strong>{loading ? '—' : visible.length}</strong><span>styles available</span></div>
    </section>
    {searchMode && <form className="tara-collection-search" onSubmit={event => { event.preventDefault(); update({ q: draftSearch }) }}><FiSearch /><input value={draftSearch} onChange={event => setDraftSearch(event.target.value)} placeholder="Search by style, brand or category" /><button>Search</button></form>}
    <div className="tara-collection-toolbar">
      <button className="tara-filter-trigger" onClick={() => setFiltersOpen(true)}><FiFilter /> Filters {activeCount > 0 && <b>{activeCount}</b>}</button>
      <p>{loading ? 'Loading collection' : `${visible.length} products`}</p>
      <label className="tara-sort">Sort by <select value={sort} onChange={event => update({ sort: event.target.value })}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select><FiChevronDown /></label>
    </div>
    <div className="tara-collection-layout">
      <aside className={`tara-filter-panel ${filtersOpen ? 'is-open' : ''}`}>
        <div className="tara-filter-head"><h2>Filters</h2><button onClick={() => setFiltersOpen(false)}><FiX /></button></div>
        <FilterGroup title="Brand" values={brands} selected={brand} onChange={value => update({ brand: value, category: '' })} />
        <FilterGroup title="Category" values={categories} selected={category} onChange={value => update({ category: value })} />
        <div className="tara-filter-group"><h3>Price</h3><div className="tara-price-fields"><label>Min<input type="number" min="0" value={min || ''} onChange={event => update({ min: event.target.value })} /></label><label>Max<input type="number" min="0" value={max || ''} onChange={event => update({ max: event.target.value })} /></label></div></div>
        <button className="tara-filter-clear" onClick={clear}>Clear all filters</button>
      </aside>
      {filtersOpen && <button className="tara-filter-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Close filters" />}
      <section className="tara-collection-results">
        {error && <div className="tara-collection-message"><h2>We could not load this collection</h2><p>{error}</p><button onClick={() => window.location.reload()}>Try again</button></div>}
        {loading && <div className="tara-product-grid">{Array.from({ length: 8 }, (_, index) => <div className="tara-product-skeleton" key={index}><i /><span /><small /></div>)}</div>}
        {!loading && !error && visible.length > 0 && <div className="tara-product-grid">{visible.map(product => <ProductCard key={product.designKey || product.id} product={product} userType={userType} />)}</div>}
        {!loading && !error && visible.length === 0 && <div className="tara-collection-message"><h2>No matching styles yet</h2><p>Change a filter or clear the current selection.</p><button onClick={clear}>View all products</button></div>}
      </section>
    </div>
  </main>
}

function FilterGroup({ title, values, selected, onChange }) {
  if (!values.length) return null
  return <div className="tara-filter-group"><h3>{title}</h3><div className="tara-filter-options"><label><input type="radio" checked={!selected} onChange={() => onChange('')} /><span>All {title.toLowerCase()}s</span></label>{values.map(value => <label key={value}><input type="radio" checked={lower(selected) === lower(value)} onChange={() => onChange(value)} /><span>{value}</span></label>)}</div></div>
}
