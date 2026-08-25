import React, { useEffect, useState } from 'react'
import { FiArrowRight, FiHeart, FiTrash2 } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { useWishlist } from '../WishlistContext'
import { currentUserId, currentUserType, fetchWishlist, money, pricingFor, removeWishlistItem } from '../services/checkoutApi'
import './Wishlist.css'

export default function Wishlist() {
  const navigate = useNavigate()
  const { wishlistItems, setWishlistItems } = useWishlist()
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const userId = currentUserId()
  const userType = currentUserType()

  useEffect(() => {
    let active = true
    if (!userId) { setLoading(false); return }
    fetchWishlist(userId).then(rows => { if (active) setWishlistItems(Array.isArray(rows) ? rows : rows?.items || []) }).catch(reason => { if (active) setNotice(reason.message || 'Unable to load wishlist') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [userId, setWishlistItems])

  const open = item => {
    sessionStorage.setItem('selectedProduct', JSON.stringify(item))
    navigate(`/product/${encodeURIComponent(item.design_code || item.style_code || item.product_id || item.id)}`)
  }
  const remove = async (event, item) => {
    event.stopPropagation()
    try {
      await removeWishlistItem(userId, item)
      setWishlistItems(rows => rows.filter(row => String(row.product_id || row.id) !== String(item.product_id || item.id)))
    } catch (reason) { setNotice(reason.message || 'Unable to remove this item') }
  }

  return <main className="tara-wishlist-page"><header className="tara-wishlist-header"><div><span>Your favourites</span><h1>Saved styles</h1><p>Keep the pieces you love close, then choose the perfect size and colour.</p></div><Link to="/">Discover more <FiArrowRight /></Link></header>{notice && <p className="tara-wishlist-notice">{notice}</p>}{loading ? <div className="tara-wishlist-grid">{Array.from({ length: 8 }, (_, index) => <i className="tara-wishlist-skeleton" key={index} />)}</div> : !userId ? <WishlistEmpty title="Sign in to see your wishlist" /> : !wishlistItems.length ? <WishlistEmpty title="No saved styles yet" /> : <div className="tara-wishlist-grid">{wishlistItems.map(item => {const price=pricingFor(item,userType);return <article key={`${item.product_id || item.id}-${item.ean_code || ''}`} className="tara-wishlist-card" onClick={() => open(item)}><div><img src={item.image_url || '/images/women/women20.jpeg'} alt={item.product_name || item.name || 'Product'} /><button onClick={event => remove(event, item)}><FiTrash2 /></button></div><span>{item.brand || item.brand_name || 'Tara'}</span><h2>{item.product_name || item.name || 'Product'}</h2><p><strong>{money(price.final)}</strong>{price.original > price.final && <del>{money(price.original)}</del>}</p><button className="tara-wishlist-select">Select options</button></article>})}</div>}</main>
}

function WishlistEmpty({ title }) { return <div className="tara-wishlist-empty"><FiHeart /><h2>{title}</h2><p>Tap the heart on any product to keep it here.</p><Link to="/">Explore products</Link></div> }
