import { apiRequest } from './api'

let cache = null

export async function fetchHomepageConfiguration() {
  if (cache) return cache
  const [images, settings] = await Promise.all([
    apiRequest('/api/homepage-images').catch(() => []),
    apiRequest('/api/homepage-images/settings').catch(() => [])
  ])
  const imageMap = {}
  const sectionSettings = {}
  ;(Array.isArray(images) ? images : []).forEach(item => {
    const key = item.id || `${item.page || 'home'}:${item.section}:${item.slot_order || 0}`
    imageMap[key] = item
  })
  ;(Array.isArray(settings) ? settings : []).forEach(item => {
    sectionSettings[`${item.page || 'home'}:${item.section}`] = item.is_enabled !== false
  })
  cache = { images: imageMap, settings: sectionSettings, rows: Array.isArray(images) ? images : [] }
  return cache
}

export const clearHomepageConfigurationCache = () => { cache = null }
