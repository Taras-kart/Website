import { apiRequest } from './api';
const stored = key => sessionStorage.getItem(key) || localStorage.getItem(key) || '';
export const currentUserId = () => stored('userId');
export const currentUserEmail = () => stored('userEmail');
export const currentUserType = () => String(stored('userType') || 'B2C').toUpperCase();
export const fetchCart = userId => apiRequest(`/api/cart/${encodeURIComponent(userId)}`);
export const updateCartQuantity = (userId, variantId, quantity) => apiRequest('/api/cart/tarascart', {
  method: 'PUT',
  body: {
    user_id: String(userId),
    product_id: Number(variantId),
    quantity: Number(quantity)
  }
});
export const removeCartItem = (userId, variantId) => apiRequest('/api/cart/tarascart', {
  method: 'DELETE',
  body: {
    user_id: String(userId),
    product_id: Number(variantId)
  }
});
export const fetchWishlist = userId => apiRequest(`/api/wishlist/${encodeURIComponent(userId)}`);
export const removeWishlistItem = (userId, product) => apiRequest('/api/wishlist', {
  method: 'DELETE',
  body: {
    user_id: String(userId),
    product_id: product.product_id || product.id,
    ean_code: product.ean_code || ''
  }
});
export const fetchCoinWallet = email => apiRequest(`/api/coins/wallet?email=${encodeURIComponent(email)}`);
export const validateCoins = (email, requested, subtotal) => apiRequest('/api/coins/validate', {
  method: 'POST',
  body: {
    email,
    coins_requested: requested,
    order_subtotal: subtotal
  }
});
export const placeWebOrder = body => apiRequest('/api/sales/web/place', {
  method: 'POST',
  body
});
export function packSizeFor(item) {
  const size = Number(item?.pack_size ?? 1);
  return Number.isSafeInteger(size) && size > 0 ? size : 1;
}
export function pricingFor(item, userType = currentUserType()) {
  const b2b = String(userType).toUpperCase() === 'B2B';
  const original = Number(b2b ? item.original_price_b2b ?? item.mrp ?? item.original_price_b2c : item.original_price_b2c ?? item.mrp ?? item.original_price_b2b) || 0;
  const resolvedFinal = Number(b2b ? item.final_price_b2b ?? item.final_price_b2c ?? item.sale_price ?? original : item.final_price_b2c ?? item.sale_price ?? original);
  const final = Number.isFinite(resolvedFinal)?resolvedFinal:original;
  return {
    original,
    final
  };
}
export const money = value => `₹${Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;
