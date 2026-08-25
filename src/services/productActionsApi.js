import { apiRequest } from './api'

const stored = key => sessionStorage.getItem(key) || localStorage.getItem(key) || ''

export const getUserId = () => stored('userId')
export const getUserType = () => String(stored('userType') || 'B2C').toUpperCase()

export async function addProductToCart(product, variant, quantity = 1) {
  const userId = getUserId()
  if (!userId) throw new Error('Please sign in to add products to your bag')
  const variantId = Number(variant?.variant_id || variant?.id || product?.variantId || 0)
  if (!variantId) throw new Error('Please select an available size and colour')
  await apiRequest('/api/cart/tarascart', {
    method: 'POST',
    body: {
      user_id: String(userId),
      product_id: variantId,
      selected_size: variant?.size || '',
      selected_color: variant?.color || variant?.colour || '',
      quantity: Number(quantity || 1)
    }
  })
  return {
    ...product,
    ...variant,
    id: variantId,
    variant_id: variantId,
    product_id: variant?.product_id || product?.productId || product?.id,
    image_url: variant?.image_url || product?.images?.[0] || '',
    selectedColor: variant?.color || variant?.colour || '',
    selectedSize: variant?.size || '',
    quantity: Number(quantity || 1)
  }
}

export async function addProductToWishlist(product, variant) {
  const userId = getUserId()
  if (!userId) throw new Error('Please sign in to save products')
  const productId = Number(variant?.product_id || product?.productId || product?.id || 0)
  if (!productId) throw new Error('Product information is unavailable')
  const item = {
    ...product,
    ...variant,
    product_id: productId,
    ean_code: variant?.ean_code || product?.ean || '',
    image_url: variant?.image_url || product?.images?.[0] || '',
    color: variant?.color || variant?.colour || ''
  }
  await apiRequest('/api/wishlist', {
    method: 'POST',
    body: {
      user_id: String(userId),
      product_id: productId,
      ean_code: item.ean_code,
      image_url: item.image_url,
      color: item.color
    }
  })
  return item
}

export async function checkPincode(pincode) {
  return apiRequest(`/api/shiprocket/pincode?pincode=${encodeURIComponent(pincode)}`)
}
