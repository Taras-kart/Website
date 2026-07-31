import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

const DEFAULT_IMG = '/images/women/women20.jpeg'

function isValidValue(v) {
  const s = String(v || '').trim().toUpperCase()
  return s !== '' && s !== 'NO' && s !== 'N/A' && s !== '-'
}

function calcSalePrice(mrp, markdownPct) {
  if (!markdownPct) return null
  return Math.round(Number(mrp) * (1 - Math.abs(Number(markdownPct)) / 100))
}

export default function B2BProductList() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const brand = searchParams.get('brand') || ''
  const gender = searchParams.get('gender') || ''

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    // B2B guard
    const userType = localStorage.getItem('userType') || sessionStorage.getItem('userType')
    if (String(userType).toUpperCase() !== 'B2B') {
      navigate('/')
      return
    }

    const fetchProducts = async () => {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams()
        if (brand) params.set('brand', brand)
        if (gender) params.set('gender', gender)

        const res = await fetch(`${API_BASE}/api/b2b/products?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [brand, gender, navigate])

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.trim().toLowerCase()
    return products.filter(p =>
      p.product_name?.toLowerCase().includes(q) ||
      p.colour?.toLowerCase().includes(q) ||
      p.style_code?.toLowerCase().includes(q) ||
      p.avb_sizes?.toLowerCase().includes(q)
    )
  }, [products, search])

  const handleProductClick = (product) => {
    // Build payload matching what CheckoutPage expects
    const salePrice = calcSalePrice(product.mrp, product.markdown_pct)
    const payload = {
      id: product.id,
      product_id: product.id,
      brand: product.brand_name,
      brand_name: product.brand_name,
      product_name: product.product_name,
      style_code: product.style_code,
      image_url: DEFAULT_IMG,
      ean_code: product.style_code,
      gender: product.gender,
      color: product.colour || '',
      colour: product.colour || '',
      size: product.avb_sizes || '',
      mrp: Number(product.mrp),
      original_price_b2b: Number(product.mrp),
      final_price_b2b: salePrice || Number(product.mrp),
      sale_price: salePrice || Number(product.mrp),
      // B2B specific fields
      markdown_pct: product.markdown_pct,
      stock_unit: product.stock_unit,
      stock_qty: product.stock_qty,
      pieces_per_box: product.pieces_per_box,
      avb_sizes: product.avb_sizes,
      design_pattern: product.design_pattern,
      fit: product.fit,
      is_b2b: true
    }
    sessionStorage.setItem('selectedProduct', JSON.stringify(payload))
    navigate('/checkout')
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.topSpacer} />

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>
            {brand || 'Wholesale Catalog'}
            {gender && <span style={styles.titleSub}> — {gender.charAt(0) + gender.slice(1).toLowerCase()}</span>}
          </h1>
          <p style={styles.subtitle}>Wholesale prices · Bulk orders</p>
        </header>

        <input
          type="text"
          placeholder="Search by product, colour, style code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.search}
        />

        {loading ? (
          <div style={styles.state}>Loading products...</div>
        ) : error ? (
          <div style={{ ...styles.state, color: '#ef4444' }}>{error}</div>
        ) : !filtered.length ? (
          <div style={styles.state}>
            {search ? 'No products match your search.' : 'No products available for this brand yet.'}
          </div>
        ) : (
          <>
            <p style={styles.count}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
            <div style={styles.grid}>
              {filtered.map(product => {
                const salePrice = calcSalePrice(product.mrp, product.markdown_pct)
                return (
                  <div
                    key={product.id}
                    style={styles.card}
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Image */}
                    <div style={styles.imgWrap}>
                      <img
                        src={DEFAULT_IMG}
                        alt={product.product_name}
                        style={styles.img}
                        onError={e => { e.currentTarget.src = DEFAULT_IMG }}
                      />
                      {product.stock_qty <= 0 && (
                        <div style={styles.outOfStock}>Out of Stock</div>
                      )}
                      {product.markdown_pct && (
                        <div style={styles.badge}>-{product.markdown_pct}%</div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={styles.info}>
                      <div style={styles.brand}>{product.brand_name}</div>
                      <div style={styles.name}>{product.product_name}</div>

                      {/* Price */}
                      <div style={styles.priceRow}>
                        <span style={styles.mrp}>MRP ₹{Number(product.mrp).toFixed(0)}</span>
                        {product.markdown_pct && (
                          <span style={styles.markdown}> -{product.markdown_pct}%</span>
                        )}
                      </div>

                      {/* B2B metadata — only show if not NO/empty */}
                      <div style={styles.meta}>
                        {isValidValue(product.colour) && (
                          <span style={styles.metaTag}>🎨 {product.colour}</span>
                        )}
                        {isValidValue(product.avb_sizes) && (
                          <span style={styles.metaTag}>📏 {product.avb_sizes}</span>
                        )}
                        {product.stock_unit === 'BOX' && product.pieces_per_box && (
                          <span style={styles.metaTag}>📦 {product.pieces_per_box} pcs/box</span>
                        )}
                        {isValidValue(product.design_pattern) && (
                          <span style={styles.metaTag}>✦ {product.design_pattern}</span>
                        )}
                        {isValidValue(product.fit) && (
                          <span style={styles.metaTag}>Fit: {product.fit}</span>
                        )}
                      </div>

                      {/* Stock */}
                      <div style={styles.stock}>
                        {product.stock_qty > 0 ? (
                          <span style={{ color: '#4ade80' }}>
                            {product.stock_unit === 'BOX'
                              ? `${product.stock_qty} box${product.stock_qty !== 1 ? 'es' : ''} available`
                              : `${product.stock_qty} pcs available`}
                          </span>
                        ) : (
                          <span style={{ color: '#ef4444' }}>Out of stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0a', color: '#e5e7eb' },
  topSpacer: { height: 80 },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 16px' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 },
  titleSub: { color: '#9ca3af', fontWeight: 400 },
  subtitle: { color: '#6b7280', marginTop: 6, fontSize: 14 },
  search: {
    width: '100%', background: '#111', border: '1px solid #374151',
    color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 14,
    marginBottom: 16, boxSizing: 'border-box', outline: 'none'
  },
  count: { color: '#6b7280', fontSize: 13, marginBottom: 16 },
  state: { textAlign: 'center', padding: 60, color: '#6b7280', fontSize: 15 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 16
  },
  card: {
    background: '#111', border: '1px solid #1f2937', borderRadius: 10,
    overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s',
  },
  imgWrap: { position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: '#1a1a1a' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  outOfStock: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 13
  },
  badge: {
    position: 'absolute', top: 8, left: 8, background: '#ca8a04',
    color: '#000', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700
  },
  info: { padding: '12px 14px' },
  brand: { fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  name: { fontSize: 14, fontWeight: 600, color: '#f9fafb', marginBottom: 8, lineHeight: 1.3 },
  priceRow: { marginBottom: 8 },
  mrp: { fontSize: 14, color: '#d1d5db' },
  markdown: { fontSize: 13, color: '#4ade80', fontWeight: 700 },
  meta: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  metaTag: {
    fontSize: 11, background: '#1f2937', color: '#9ca3af',
    padding: '2px 6px', borderRadius: 4
  },
  stock: { fontSize: 12, marginTop: 4 }
}
