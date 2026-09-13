import { useRef, useState } from 'react'
import { useWishlist } from '../WishlistContext'
import { addProductToWishlist } from '../services/productActionsApi'

export default function useProductWishlist(product) {
  const { wishlistItems, addToWishlist } = useWishlist()
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const busy = useRef(false)
  const variant = product?.variants?.[0] || product
  const id = Number(variant?.product_id || product?.productId || product?.product_id || product?.id)
  const saved = wishlistItems.some(item => Number(item.product_id || item.productId || item.id) === id)
  const save = async () => {
    if (busy.current || saved) return
    busy.current = true
    setPending(true)
    setMessage('')
    try {
      const item = await addProductToWishlist(product, variant)
      addToWishlist(item)
    } catch (error) {
      setMessage(error.message || 'Unable to save this product')
    } finally {
      busy.current = false
      setPending(false)
    }
  }
  return { save, saved, pending, message }
}
