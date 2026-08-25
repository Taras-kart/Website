const cloud=import.meta.env.VITE_CLOUDINARY_CLOUD||'deymt9uyh'
const num=value=>Number(value||0)
const text=value=>String(value||'').trim()
const imageValue=value=>typeof value==='string'?value:text(value?.image_url||value?.imageUrl||value?.url)

export function normalizeProduct(row,index=0){
  const variants=Array.isArray(row.variants)?row.variants:[row]
  const first=variants.find(v=>v.is_active!==false)||variants[0]||row
  const ean=text(first.ean_code||first.barcode||row.ean_code||row.barcode)
  const images=[row.front_image_url,row.main_image_url,row.image_url,...(Array.isArray(row.images)?row.images.map(imageValue):[]),first.front_image_url,first.image_url].filter(Boolean)
  const originalB2C=num(first.original_price_b2c||row.original_price_b2c||first.mrp||row.mrp)
  const finalB2C=num(first.final_price_b2c||row.final_price_b2c||first.sale_price||row.sale_price||originalB2C)
  const originalB2B=num(first.original_price_b2b||row.original_price_b2b||first.mrp||row.mrp)
  const finalB2B=num(first.final_price_b2b||row.final_price_b2b||first.sale_price||row.sale_price||originalB2B)
  return {...row,id:row.product_id||row.id||index+1,productId:row.product_id||row.id,variantId:first.variant_id||first.id||row.variant_id,name:text(row.product_name||row.name||row.title||'Product'),brand:text(row.brand_name||row.brand||'Tara'),gender:text(row.gender).toUpperCase(),category:text(row.category_name||row.category||row.category_slug),design:text(row.design_code||row.style_code||row.product_id||row.id),ean,images:images.length?images:[ean?`https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto/products/${ean}`:'/images/women/women20.jpeg'],variants,originalB2C,finalB2C,originalB2B,finalB2B,available:num(first.available_qty??first.on_hand??row.available_qty??row.on_hand),color:text(first.colour||first.color||row.colour||row.color),size:text(first.size||row.size)}
}

export function groupProducts(rows=[]){
  const map=new Map()
  rows.map(normalizeProduct).forEach(p=>{const key=text(p.design||`${p.brand}|${p.name}`).toLowerCase();if(!map.has(key))map.set(key,{...p,variants:[]});const item=map.get(key);item.variants.push(...p.variants.map(v=>({...v,variant_id:v.variant_id||v.id,product_id:v.product_id||p.productId})));item.images=[...new Set([...item.images,...p.images])];item.available+=p===item?0:p.available})
  return [...map.values()]
}

export const priceFor=(product,isB2B)=>({original:isB2B?product.originalB2B:product.originalB2C,final:isB2B?product.finalB2B:product.finalB2C})
export const money=value=>`₹${Number(value||0).toLocaleString('en-IN',{maximumFractionDigits:2})}`
