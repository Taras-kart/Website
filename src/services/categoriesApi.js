import { apiRequest } from './api'

const clean = value => String(value || '').trim()
const cloud = process.env.REACT_APP_CLOUDINARY_CLOUD || 'deymt9uyh'
const unique = values => [...new Set(values.map(clean).filter(Boolean))]

export async function fetchCategories() {
  const data = await apiRequest('/api/categories?active=true&withCounts=true')
  const rows = Array.isArray(data) ? data : data?.categories || []
  return rows.map(row => {
    const ean = clean(row?.representative_ean || row?.ean_code)
    const databaseImage = clean(row?.representative_image || row?.image_url || row?.imageUrl)
    const apiCandidates = Array.isArray(row?.image_candidates) ? row.image_candidates.map(candidate => clean(candidate?.url || candidate)) : []
    const generatedImage = ean ? `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto/products/${encodeURIComponent(ean)}` : ''
    const imageCandidates = unique([databaseImage, ...apiCandidates, generatedImage])
    return {
      id: Number(row?.id || row?.category_id || 0),
      parentId: row?.parent_id == null ? null : Number(row.parent_id),
      name: clean(row?.name || row?.category_name),
      slug: clean(row?.slug || row?.category_slug),
      gender: clean(row?.gender || row?.root_name).toUpperCase(),
      level: Number(row?.level || 0),
      sortOrder: Number(row?.sort_order || 0),
      productCount: Number(row?.product_count || row?.count || 0),
      image: databaseImage,
      imageCandidates,
      representativeEan: ean
    }
  }).filter(item => item.id && item.name && item.productCount > 0)
}
