import {API_BASE} from './api'
export const imageUrl=value=>{
  const raw=String(typeof value==='string'?value:value?.url||value?.image_url||'').trim()
  if(!raw)return ''
  if(/^https?:\/\//i.test(raw)||raw.startsWith('data:image/'))return raw
  if(raw.startsWith('//'))return `https:${raw}`
  if(/^\/?uploads\//i.test(raw))return `${API_BASE}/${raw.replace(/^\//,'')}`
  return raw.startsWith('/')?raw:`/${raw}`
}
export const imageSources=record=>[...new Set([...(record?.image_candidates||[]),record?.representative_image,record?.shared_image_url,record?.front_image_url,record?.image_url,record?.variant_image_url,...(record?.images||[])].map(imageUrl).filter(Boolean))].filter(url=>!/(\/defaults\/|placeholder|coming-soon)/i.test(url))
