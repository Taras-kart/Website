import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FiArrowLeft, FiCheck, FiGift, FiMinus, FiPlus, FiShield, FiShoppingBag, FiTrash2 } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../CartContext'
import { currentUserId, currentUserType, fetchCart, money, pricingFor, removeCartItem, updateCartQuantity } from '../services/checkoutApi'
import './Cart.css'

export default function Cart() {
  const navigate = useNavigate()
  const { removeFromCart } = useCart()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [giftWrap, setGiftWrap] = useState(false)
  const [notice, setNotice] = useState('')
  const userId = currentUserId()
  const userType = currentUserType()

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    try {
      const rows = await fetchCart(userId)
      setItems(Array.isArray(rows) ? rows : rows?.items || [])
    } catch (reason) {
      showNotice(reason.message || 'Unable to load your bag')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const totals = useMemo(() => items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 1)
    const price = pricingFor(item, userType)
    sum.bag += price.original * quantity
    sum.payable += price.final * quantity
    return sum
  }, { bag: 0, payable: 0 }), [items, userType])
  const discount = Math.max(0, totals.bag - totals.payable)
  const gift = giftWrap ? 39 : 0

  const changeQuantity = async (item, next) => {
    const quantity = Math.max(1, Math.min(99, next))
    const id = item.id || item.variant_id
    setItems(rows => rows.map(row => (row.id || row.variant_id) === id ? { ...row, quantity } : row))
    setBusy(`qty-${id}`)
    try { await updateCartQuantity(userId, id, quantity) } catch { await load() } finally { setBusy('') }
  }

  const remove = async item => {
    const id = item.id || item.variant_id
    setBusy(`remove-${id}`)
    try {
      await removeCartItem(userId, id)
      setItems(rows => rows.filter(row => (row.id || row.variant_id) !== id))
      removeFromCart(id)
      showNotice('Item removed from your bag')
    } catch (reason) {
      showNotice(reason.message || 'Unable to remove this item')
    } finally { setBusy('') }
  }

  const checkout = () => {
    const payload = {
      totals: { bagTotal: totals.bag, discountTotal: discount, couponPct: 0, couponDiscount: 0, convenience: 0, giftWrap: gift, payable: totals.payable + gift },
      items: items.map(item => {
        const price = pricingFor(item, userType)
        return { variant_id: item.id || item.variant_id, product_id: item.product_id || null, qty: Number(item.quantity || 1), price: price.final, mrp: price.original, size: item.selected_size || item.size || '', colour: item.selected_color || item.color || '', image_url: item.image_url || '' }
      })
    }
    sessionStorage.setItem('tk_checkout_payload', JSON.stringify(payload))
    navigate('/order/checkout')
  }

  function showNotice(message) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 1800)
  }

  if (loading) return <main className="tara-cart-page"><CartHeader count="" /><div className="tara-cart-loading"><i /><i /><i /></div></main>
  if (!userId) return <EmptyCart title="Sign in to view your bag" text="Your saved shopping bag will appear here after you sign in." />
  if (!items.length) return <EmptyCart title="Your bag is empty" text="Discover something you love and add it to your bag." />

  return <main className="tara-cart-page">
    {notice && <div className="tara-cart-toast"><FiCheck />{notice}</div>}
    <CartHeader count={`${items.length} ${items.length === 1 ? 'item' : 'items'}`} />
    <div className="tara-cart-layout">
      <section className="tara-cart-list">
        {items.map(item => {
          const id = item.id || item.variant_id
          const price = pricingFor(item, userType)
          const quantity = Number(item.quantity || 1)
          return <article className="tara-cart-item" key={id}>
            <img src={item.image_url || '/images/women/women20.jpeg'} alt={item.product_name || item.name || 'Product'} />
            <div className="tara-cart-copy"><span>{item.brand || item.brand_name || 'Attach'}</span><h2>{item.product_name || item.name || 'Product'}</h2><p>{[item.selected_color || item.color, item.selected_size || item.size].filter(Boolean).join(' · ')}</p><div className="tara-cart-price"><strong>{money(price.final)}</strong>{price.original > price.final && <del>{money(price.original)}</del>}</div><div className="tara-cart-actions"><div className="tara-cart-quantity"><button onClick={() => changeQuantity(item, quantity - 1)}><FiMinus /></button><span>{busy === `qty-${id}` ? '…' : quantity}</span><button onClick={() => changeQuantity(item, quantity + 1)}><FiPlus /></button></div><button disabled={busy === `remove-${id}`} onClick={() => remove(item)}><FiTrash2 />Remove</button></div></div>
            <strong className="tara-cart-line-total">{money(price.final * quantity)}</strong>
          </article>
        })}
        <label className="tara-gift-wrap"><span><FiGift /><i><strong>Add gift wrapping</strong><small>Your order will arrive ready to gift</small></i></span><em>₹39</em><input type="checkbox" checked={giftWrap} onChange={event => setGiftWrap(event.target.checked)} /></label>
      </section>
      <aside className="tara-cart-summary"><span>Order summary</span><h2>{money(totals.payable + gift)}</h2><div><p><span>Bag total</span><strong>{money(totals.bag)}</strong></p><p className="is-saving"><span>Product discount</span><strong>-{money(discount)}</strong></p>{gift > 0 && <p><span>Gift wrapping</span><strong>{money(gift)}</strong></p>}<p className="tara-cart-total"><span>You pay</span><strong>{money(totals.payable + gift)}</strong></p></div><button onClick={checkout}>Continue to checkout</button><small><FiShield />Secure checkout and protected payment</small></aside>
    </div>
  </main>
}

function CartHeader({ count }) { return <header className="tara-cart-header"><div><span>Your selection</span><h1>Shopping bag</h1><p>{count}</p></div><Link to="/"><FiArrowLeft />Continue shopping</Link></header> }
function EmptyCart({ title, text }) { return <main className="tara-cart-page"><CartHeader count="" /><div className="tara-cart-empty"><FiShoppingBag /><h2>{title}</h2><p>{text}</p><Link to="/">Explore collections</Link></div></main> }
