import { apiRequest } from './api'

const cloud = import.meta.env?.VITE_CLOUDINARY_CLOUD || process.env.REACT_APP_CLOUDINARY_CLOUD || 'deymt9uyh'
const clean = value => String(value || '').trim()
const number = value => Number(value || 0)
const normalize = value => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '')
const imageValue = value => typeof value === 'string' ? value : clean(value?.image_url || value?.imageUrl || value?.url)
const unique = values => [...new Set(values.map(clean).filter(Boolean))]

export function normalizeProduct(row, index = 0) {
  const variants = Array.isArray(row?.variants) && row.variants.length ? row.variants : [row]
  const primary = variants.find(item => item?.is_active !== false) || variants[0] || row
  const ean = clean(primary?.ean_code || primary?.barcode || row?.ean_code || row?.barcode)
  const images = unique([
    row?.shared_image_url,
    row?.front_image_url,
    row?.main_image_url,
    row?.image_url,
    ...(Array.isArray(row?.images) ? row.images.map(imageValue) : []),
    ...variants.flatMap(variant => [variant?.shared_image_url, variant?.front_image_url, variant?.main_image_url, variant?.image_url])
  ])
  const originalB2C = number(primary?.original_price_b2c || row?.original_price_b2c || primary?.mrp || row?.mrp)
  const finalB2C = number(primary?.final_price_b2c || row?.final_price_b2c || primary?.sale_price || row?.sale_price || originalB2C)
  const originalB2B = number(primary?.original_price_b2b || row?.original_price_b2b || primary?.mrp || row?.mrp)
  const finalB2B = number(primary?.final_price_b2b || row?.final_price_b2b || primary?.sale_price || row?.sale_price || originalB2B)
  const brand = clean(row?.brand_name || row?.brand || 'Tara')
  const name = clean(row?.product_name || row?.name || row?.title || 'Product')
  const design = clean(row?.design_code || row?.pattern_code || row?.style_code || row?.mark_code)
  const fit = clean(row?.fit_type || row?.fit)
  const designKey = [normalize(brand), normalize(name), normalize(design), normalize(fit)].filter(Boolean).join('|')
  return {
    ...row,
    id: row?.product_id || row?.id || index + 1,
    productId: row?.product_id || row?.id,
    variantId: primary?.variant_id || primary?.id || row?.variant_id,
    name,
    brand,
    gender: clean(row?.gender || row?.category_root).toUpperCase(),
    categoryId: number(row?.category_id),
    category: clean(row?.category_name || row?.category || row?.category_slug),
    categorySlug: clean(row?.category_slug),
    categoryPath: clean(row?.category_path),
    categoryRoot: clean(row?.category_root).toUpperCase(),
    designKey: designKey || `${normalize(brand)}|${normalize(name)}`,
    ean,
    images: images.length ? images : [ean ? `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto/products/${encodeURIComponent(ean)}` : ''],
    variants,
    colours: unique(variants.flatMap(variant => [variant?.colour, variant?.color])),
    sizes: unique(variants.map(variant => variant?.size)),
    originalB2C,
    finalB2C,
    originalB2B,
    finalB2B,
    available: number(primary?.available_qty ?? primary?.on_hand ?? row?.available_qty ?? row?.on_hand)
  }
}

export function groupProducts(rows = []) {
  const groups = new Map()
  rows.map(normalizeProduct).forEach(product => {
    const key = `${normalize(product.brand)}|${normalize(product.name)}`
    if (!groups.has(key)) groups.set(key, { ...product, designKey: key, variants: [], images: [], colours: [], sizes: [], available: 0, productIds: [] })
    const group = groups.get(key)
    group.productIds = unique([...group.productIds, product.productId])
    group.variants.push(...product.variants)
    group.images = unique([...group.images, ...product.images])
    group.colours = unique([...group.colours, ...product.colours])
    group.sizes = unique([...group.sizes, ...product.sizes])
    group.available += product.available
  })
  return [...groups.values()]
}

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value))
  })
  const data = await apiRequest(`/api/products?${query.toString()}`)
  return groupProducts(Array.isArray(data) ? data : data?.products || [])
}

export const getPrice = (product, type = 'B2C') => String(type).toUpperCase() === 'B2B'
  ? { original: product.originalB2B, final: product.finalB2B }
  : { original: product.originalB2C, final: product.finalB2C }

export const formatPrice = value => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
