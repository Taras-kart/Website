import { apiRequest } from './api'

export const SUBTYPE_LABELS = {
  shimmer: 'Shimmer', viscose: 'Viscose', cotton: 'Cotton', lycra: 'Lycra',
  rayon: 'Rayon', nylon: 'Nylon', polyester: 'Polyester', spandex: 'Spandex',
  silk: 'Silk', modal: 'Modal', seamless: 'Seamless', ribbed: 'Ribbed',
  denim: 'Denim', fleece: 'Fleece', thermal: 'Thermal', printed: 'Printed',
  sports: 'Sports', 'non-padded': 'Non-padded', padded: 'Padded',
  'non-wired': 'Non-wired', wired: 'Wired', 'push-up': 'Push-up',
  't-shirt': 'T-shirt', maternity: 'Maternity', other: 'Other'
}
export const subtypeTitle = (subtype, categoryName = '') => {
  const label = SUBTYPE_LABELS[subtype] || subtype
  return subtype === 'other' ? `Other ${categoryName || 'styles'}` : `${label} ${categoryName}`.trim()
}
export async function fetchSubcategories({ brand, categoryId, gender }, options = {}) {
  const query = new URLSearchParams({ brand, categoryId: String(categoryId) })
  if (gender) query.set('gender', gender)
  return apiRequest(`/api/products/subcategories?${query}`, options)
}
