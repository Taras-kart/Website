import React, { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import './CheckoutPage.css'
import { useCart } from '../CartContext'
import { useWishlist } from '../WishlistContext'
import { FaHeart, FaShoppingBag } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const DEFAULT_API_BASE = 'https://taras-kart-backend.vercel.app'
const API_BASE_RAW =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  DEFAULT_API_BASE
const API_BASE = API_BASE_RAW.replace(/\/+$/, '')

const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : typeof process !== 'undefined' && process.env
    ? process.env
    : {}

const fallbackFirebase = {
  apiKey: 'AIzaSyCXytrftmbkF6IHsgpByDcpB4oUSwdJV0M',
  authDomain: 'taraskart-6e601.firebaseapp.com',
  projectId: 'taraskart-6e601',
  storageBucket: 'taraskart-6e601.appspot.com',
  messagingSenderId: '549582561307',
  appId: '1:549582561307:web:40827cc8fc2b1696b718be'
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || env.REACT_APP_FIREBASE_API_KEY || fallbackFirebase.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.REACT_APP_FIREBASE_AUTH_DOMAIN || fallbackFirebase.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || env.REACT_APP_FIREBASE_PROJECT_ID || fallbackFirebase.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.REACT_APP_FIREBASE_STORAGE_BUCKET || fallbackFirebase.storageBucket,
  messagingSenderId:
    env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ||
    fallbackFirebase.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || env.REACT_APP_FIREBASE_APP_ID || fallbackFirebase.appId
}

if (!getApps().length) initializeApp(firebaseConfig)
const auth = getAuth()

const isIntId = (v) => {
  const n = Number(v)
  return Number.isInteger(n) && n > 0
}

/* ══════════════════════════════════════════════════════════════
   COLOR NAME → HEX
   Fashion-specific palette. Unknown names get a deterministic
   pastel derived from the string so they're always consistent.
   ══════════════════════════════════════════════════════════════ */
const COLOR_MAP = {
  // Whites & Creams
  'WHITE': '#FFFFFF', 'OFF WHITE': '#FAF7F0', 'CREAM': '#FFFDD0', 'IVORY': '#FFFFF0',
  'PEARL': '#EAE0C8', 'PEARLY VANILLA': '#F5F0E8', 'VANILLA': '#F3E5AB',
  'SNOW WHITE': '#FFFAFA', 'MILK WHITE': '#FEFEFE', 'CHALK': '#F2F0EB',
  // Blacks & Greys
  'BLACK': '#1A1A1A', 'CHARCOAL': '#36454F', 'DARK GREY': '#4A4A4A',
  'GREY': '#888888', 'ASH GREY': '#B2BEB5', 'LIGHT GREY': '#D3D3D3',
  'SILVER': '#C0C0C0', 'STEEL GREY': '#71797E', 'SLATE': '#708090',
  'GRAPHITE': '#3B3B3B', 'SMOKE': '#848884',
  // Reds
  'RED': '#DC143C', 'DARK RED': '#8B0000', 'CRIMSON': '#DC143C',
  'RUBY': '#9B111E', 'MAROON': '#800000', 'WINE': '#722F37',
  'BURGUNDY': '#800020', 'ROSE': '#FF007F', 'CORAL': '#FF6B6B',
  'BRICK RED': '#CB4154', 'TOMATO': '#FF6347',
  // Pinks
  'PINK': '#FFB6C1', 'HOT PINK': '#FF69B4', 'BABY PINK': '#F4C2C2',
  'COTTON CANDY': '#FFBCD9', 'BUBBLEGUM': '#FFC1CC', 'BLUSH': '#DE5D83',
  'DUSTY PINK': '#DCAE96', 'MAUVE': '#E0B0B0', 'SALMON': '#FA8072',
  'FLAMINGO': '#FC8EAC', 'ROSE PINK': '#FF66B2', 'PEACH': '#FFCBA4',
  'LIGHT PINK': '#FFD1DC', 'CANDY PINK': '#FF9EAF',
  // Oranges
  'ORANGE': '#FF7F00', 'BURNT ORANGE': '#CC5500', 'AMBER': '#FFBF00',
  'RUST': '#B7410E', 'COPPER': '#B87333', 'TANGERINE': '#F28500',
  'PUMPKIN': '#FF7518', 'APRICOT': '#FBCEB1', 'MANGO': '#FF8243',
  // Yellows
  'YELLOW': '#FFD700', 'LEMON': '#FFF44F', 'MUSTARD': '#FFDB58',
  'GOLD': '#FFD700', 'GOLDEN': '#FFC200', 'HONEY': '#EEA820',
  'BUTTERCUP': '#F3E03B', 'SUNSHINE': '#FFE135', 'BUTTER': '#FFFAA0',
  'HONEY DEW': '#F0FFF0', 'CARAMEL': '#C68642', 'CARAMEL CUSTARD': '#D4A055',
  'MOCHA': '#967969', 'MOCHA BEAN': '#6F4E37', 'TOFFEE': '#704214',
  // Greens
  'GREEN': '#228B22', 'DARK GREEN': '#006400', 'FOREST GREEN': '#228B22',
  'OLIVE': '#808000', 'OLIVE GREEN': '#6B8E23', 'MINT': '#98FF98',
  'SAGE': '#B2AC88', 'TEAL': '#008080', 'EMERALD': '#50C878',
  'LIME': '#32CD32', 'TURQUOISE': '#40E0D0', 'JADE': '#00A86B',
  'AQUA': '#00FFFF', 'SEAFOAM': '#93E9BE', 'GRASS': '#7CFC00',
  'BOTTLE GREEN': '#006A4E', 'PINE': '#01796F', 'HUNTER GREEN': '#355E3B',
  // Blues
  'BLUE': '#4169E1', 'DARK BLUE': '#00008B', 'NAVY': '#000080',
  'NAVY BLUE': '#000080', 'NAVY CLASSIC': '#1B2A4A', 'SKY BLUE': '#87CEEB',
  'BABY BLUE': '#89CFF0', 'ROYAL BLUE': '#4169E1', 'COBALT': '#0047AB',
  'DENIM': '#1560BD', 'STEEL BLUE': '#4682B4', 'CORNFLOWER': '#6495ED',
  'POWDER BLUE': '#B0E0E6', 'CERULEAN': '#007BA7', 'INDIGO': '#4B0082',
  'MIDNIGHT BLUE': '#191970', 'OCEAN BLUE': '#0077BE',
  // Purples
  'PURPLE': '#800080', 'VIOLET': '#EE82EE', 'LAVENDER': '#E6E6FA',
  'LILAC': '#C8A2C8', 'PLUM': '#DDA0DD', 'MAUVE PURPLE': '#9F5F80',
  'GRAPE': '#6F2DA8', 'AMETHYST': '#9966CC', 'ORCHID': '#DA70D6',
  'DARK PURPLE': '#4B0082', 'BERRY': '#8E2157',
  // Browns & Nudes
  'BROWN': '#8B4513', 'DARK BROWN': '#5C4033', 'TAN': '#D2B48C',
  'BEIGE': '#F5F5DC', 'KHAKI': '#C3B091', 'NUDE': '#E8C99A',
  'COFFEE': '#6F4E37', 'CHOCOLATE': '#7B3F00', 'CHESTNUT': '#954535',
  'WALNUT': '#5C4033', 'SAND': '#C2B280', 'FAWN': '#E5AA70',
  'LATTE': '#C4A882', 'BISCUIT': '#E8C99A',
  // Multicolours / special
  'MULTICOLOUR': 'linear-gradient(135deg,#f43,#fa0,#4f4,#48f,#a4f)',
  'MULTI': 'linear-gradient(135deg,#f43,#fa0,#4f4,#48f,#a4f)',
  'PRINTED': 'linear-gradient(135deg,#e0c,#c0e,#08f)',
  'STRIPED': 'linear-gradient(180deg,#111 0%,#111 50%,#fff 50%,#fff 100%)',
  'SHIMMER': 'linear-gradient(135deg,#c9a84c,#f5d485,#c9a84c,#f5d485)',
  'METALLIC': 'linear-gradient(135deg,#a8a8a8,#e0e0e0,#a8a8a8)',
  'GOLD MINE': 'linear-gradient(135deg,#BF953F,#FCF6BA,#B38728,#FBF5B7)',
}

/**
 * Returns a CSS color value for a given color name string.
 * Falls back to a deterministic HSL pastel for unmapped names.
 */
function resolveColor(name) {
  if (!name) return '#CCCCCC'
  const key = String(name).trim().toUpperCase()

  // Direct match
  if (COLOR_MAP[key]) return COLOR_MAP[key]

  // Partial match — find first key contained in the name
  for (const [k, v] of Object.entries(COLOR_MAP)) {
    if (key.includes(k) || k.includes(key.split(' ')[0])) return v
  }

  // Deterministic fallback: hash the string to a pleasing hue
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 45%, 68%)`
}

/* ══════════════════════════════════════════════════════════════
   Decorative floating stars (unchanged)
   ══════════════════════════════════════════════════════════════ */
const Stars = () => {
  const stars = [
    { top: '10%', left: '8%',  size: 10, d: 0.18 },
    { top: '18%', left: '86%', size: 14, d: 0.28 },
    { top: '34%', left: '12%', size: 12, d: 0.22 },
    { top: '48%', left: '92%', size: 10, d: 0.18 },
    { top: '70%', left: '6%',  size: 16, d: 0.26 },
    { top: '78%', left: '84%', size: 12, d: 0.22 }
  ]
  return (
    <div className="co-stars" aria-hidden="true">
      {stars.map((s, i) => (
        <svg
          key={i}
          className="co-star"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: `${s.d}s` }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" className="co-star-path" />
        </svg>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Color Swatch — shows real color dot + name, no product image
   ══════════════════════════════════════════════════════════════ */
function ColorSwatch({ colorName, isActive, onClick }) {
  const cssColor = resolveColor(colorName)
  const isGradient = cssColor.startsWith('linear-gradient')

  return (
    <button
      type="button"
      className={`co-swatch${isActive ? ' active' : ''}`}
      onClick={onClick}
      title={colorName}
      aria-pressed={isActive}
      aria-label={colorName}
    >
      <span
        className="co-swatch-dot"
        style={isGradient ? { backgroundImage: cssColor } : { backgroundColor: cssColor }}
      />
      <span className="co-swatch-tooltip">{colorName}</span>
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main Component — all logic 100% unchanged
   ══════════════════════════════════════════════════════════════ */
const CheckoutPage = () => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { addToWishlist } = useWishlist()

  const [lens, setLens] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [zoomStyles, setZoomStyles] = useState({ offsetX: 0, offsetY: 0, zoomLeft: false })
  const [isHovering, setIsHovering] = useState(false)

  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [colorImages, setColorImages] = useState({})
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)

  const [popupMessage, setPopupMessage] = useState('')
  const [pincode, setPincode] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [isCheckingPin, setIsCheckingPin] = useState(false)
  const [pincodeStatus, setPincodeStatus] = useState(null)
  const [pincodeMessage, setPincodeMessage] = useState('')

  const [userId, setUserId] = useState(() => {
    if (typeof window === 'undefined') return ''
    const stored = sessionStorage.getItem('userId') || localStorage.getItem('userId') || ''
    return isIntId(stored) ? String(stored) : ''
  })

  const [userType, setUserType] = useState(() => {
    if (typeof window === 'undefined') return 'B2C'
    return sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C'
  })

  const zoomFactor = 3

  useEffect(() => {
    const storedProduct = sessionStorage.getItem('selectedProduct')
    if (storedProduct) setProduct(JSON.parse(storedProduct))
  }, [])

  useEffect(() => {
    return () => { sessionStorage.removeItem('selectedProduct') }
  }, [])

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const hydrateBackendUser = async (email) => {
    if (!email) return
    try {
      const res = await fetch(`${API_BASE}/api/user/by-email/${encodeURIComponent(email)}`, { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (!data || !isIntId(data.id)) return
      const idStr = String(data.id)
      const typeStr = String(data.type || 'B2C')
      setUserId(idStr)
      setUserType(typeStr)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('userId', idStr)
        localStorage.setItem('userId', idStr)
        sessionStorage.setItem('userType', typeStr)
        localStorage.setItem('userType', typeStr)
        sessionStorage.setItem('userEmail', String(data.email || email))
      }
    } catch {}
  }

  useEffect(() => {
    const syncUser = () => {
      if (typeof window === 'undefined') return
      const storedId = sessionStorage.getItem('userId') || localStorage.getItem('userId') || ''
      const storedType = sessionStorage.getItem('userType') || localStorage.getItem('userType') || 'B2C'
      if (isIntId(storedId) && storedId !== userId) setUserId(String(storedId))
      if (storedType && storedType !== userType) setUserType(storedType)
    }
    window.addEventListener('storage', syncUser)
    const interval = setInterval(syncUser, 500)
    return () => { window.removeEventListener('storage', syncUser); clearInterval(interval) }
  }, [userId, userType])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) return
      const email = u.email || (typeof window !== 'undefined' ? sessionStorage.getItem('userEmail') : '') || ''
      if (email) {
        if (typeof window !== 'undefined') sessionStorage.setItem('userEmail', email)
        hydrateBackendUser(email)
      }
      if (typeof window !== 'undefined') {
        const name = u.displayName || (email ? email.split('@')[0] : 'User')
        if (!sessionStorage.getItem('userName')) sessionStorage.setItem('userName', name)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const email =
      (typeof window !== 'undefined' ? sessionStorage.getItem('userEmail') : '') ||
      (typeof window !== 'undefined' ? localStorage.getItem('userEmail') : '') || ''
    if (email && !userId) hydrateBackendUser(email)
  }, [userId])

  useEffect(() => {
    const loadVariants = async () => {
      if (!product) return
      setIsLoading(true)
      try {
        const q = encodeURIComponent(product.product_name || '')
        const res = await fetch(`${API_BASE}/api/products?limit=300&hasImage=true&q=${q}`)
        const data = await res.json()
        const same = (Array.isArray(data) ? data : []).filter(
          (r) =>
            String(r.brand || r.brand_name || '').trim().toUpperCase() ===
              String(product.brand || '').trim().toUpperCase() &&
            String(r.product_name || r.name || '').trim().toUpperCase() ===
              String(product.product_name || '').trim().toUpperCase()
        )
        const mapped = same.map((r) => ({
          id: r.id,
          product_id: r.product_id,
          color: r.color || r.colour || '',
          size: r.size || '',
          image_url: r.image_url,
          ean_code: r.ean_code || '',
          original_price_b2c: r.original_price_b2c,
          final_price_b2c: r.final_price_b2c,
          original_price_b2b: r.original_price_b2b,
          final_price_b2b: r.final_price_b2b,
          mrp: r.mrp,
          sale_price: r.sale_price
        }))
        setVariants(mapped)

        const byColor = {}
        mapped.forEach((v) => {
          const key = v.color || 'DEFAULT'
          if (!byColor[key]) byColor[key] = []
          if (v.image_url) byColor[key].push(v.image_url)
        })
        Object.keys(byColor).forEach((k) => { byColor[k] = Array.from(new Set(byColor[k])) })
        setColorImages(byColor)

        const initialColor = product.color || product.colour || mapped[0]?.color || null
        setSelectedColor(initialColor)

        const sizesForInitial = Array.from(
          new Set(
            mapped
              .filter((v) => (initialColor ? v.color === initialColor : true))
              .map((v) => v.size)
              .filter(Boolean)
          )
        )
        const preferredSize = sizesForInitial.includes(product.size) ? product.size : sizesForInitial[0] || null
        setSelectedSize(preferredSize)
      } catch {
      } finally {
        setIsLoading(false)
      }
    }
    loadVariants()
  }, [product])

  const sizesForColor = () => {
    if (!selectedColor) return Array.from(new Set(variants.map((v) => v.size).filter(Boolean)))
    return Array.from(new Set(variants.filter((v) => v.color === selectedColor).map((v) => v.size).filter(Boolean)))
  }

  const mainImage = () => {
    if (!product) return ''
    if (selectedColor) {
      const foundImage = colorImages[selectedColor]?.[0]
      if (foundImage) return foundImage
    }
    return product.image_url
  }

  const handleColorClick = (color) => {
    setSelectedColor(color)
    const sizes = (() => {
      if (!color) return Array.from(new Set(variants.map((v) => v.size).filter(Boolean)))
      return Array.from(new Set(variants.filter((v) => v.color === color).map((v) => v.size).filter(Boolean)))
    })()
    const newSize = sizes.includes(selectedSize) ? selectedSize : sizes[0] || null
    setSelectedSize(newSize)
  }

  const handleSizeClick = (size) => { setSelectedSize(size) }

  const getActivePricing = () => {
    const variant = variants.find((v) => v.color === selectedColor && v.size === selectedSize) || null
    const base = variant || product || {}
    if (userType === 'B2B') {
      const mrp = Number(base.original_price_b2b || base.mrp || 0)
      const offer = Number(base.final_price_b2b || base.sale_price || 0) || 0
      return { mrp, offer }
    }
    const mrp = Number(base.original_price_b2c || base.mrp || 0)
    const offer = Number(base.final_price_b2c || base.sale_price || 0) || 0
    return { mrp, offer }
  }

  const getDiscount = () => {
    const { mrp, offer } = getActivePricing()
    if (!mrp || !offer || mrp <= offer) return 0
    return Math.round(((mrp - offer) / mrp) * 100)
  }

  const handleAdd = async (type) => {
    const effectiveUserId =
      (typeof window !== 'undefined' ? sessionStorage.getItem('userId') : '') ||
      (typeof window !== 'undefined' ? localStorage.getItem('userId') : '') ||
      userId

    if (!isIntId(effectiveUserId)) {
      setPopupMessage('Please sign in to continue')
      setTimeout(() => setPopupMessage(''), 2000)
      return
    }

    if (type === 'bag') {
      if (!selectedColor || !selectedSize || !(product?.product_id || product?.id)) {
        setPopupMessage('Please select color and size')
        setTimeout(() => setPopupMessage(''), 2000)
        return
      }
    }

    const chosenVariant = variants.find((v) => v.color === selectedColor && v.size === selectedSize) || null
    const item = {
      ...(product || {}),
      ...(chosenVariant || {}),
      product_id: chosenVariant?.product_id || product?.product_id || product?.id || null,
      variant_id: chosenVariant?.id || null,
      image_url: mainImage(),
      selectedColor,
      selectedSize,
      quantity: 1
    }

    if (type === 'bag') {
      if (!isIntId(item.variant_id)) {
        setPopupMessage('Variant not found')
        setTimeout(() => setPopupMessage(''), 2000)
        return
      }
      const resp = await fetch(`${API_BASE}/api/cart/tarascart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: String(effectiveUserId),
          product_id: Number(item.variant_id),
          selected_size: selectedSize,
          selected_color: selectedColor,
          quantity: 1
        })
      })
      if (resp.ok) {
        addToCart(item)
        window.scrollTo(0, 0)
        navigate('/cart')
      } else {
        setPopupMessage('Please Loggin and Try again')
        setTimeout(() => setPopupMessage(''), 2000)
      }
    } else {
      if (!isIntId(item.product_id)) {
        setPopupMessage('Product not found')
        setTimeout(() => setPopupMessage(''), 2000)
        return
      }
      const resp = await fetch(`${API_BASE}/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: String(effectiveUserId),
          product_id: Number(item.product_id),
          ean_code: item.ean_code || '',
          image_url: item.image_url || '',
          color: item.color || item.selectedColor || ''
        })
      })
      if (resp.ok) {
        addToWishlist(item)
        setPopupMessage('Added to wishlist successfully')
        setTimeout(() => setPopupMessage(''), 2000)
      } else {
        setPopupMessage('Failed to add to wishlist')
        setTimeout(() => setPopupMessage(''), 2000)
      }
    }
  }

  const handleMouseMove = (e) => {
    const image = e.target
    const rect = image.getBoundingClientRect()
    const { left, width, height } = rect
    const x = e.clientX - left
    const y = e.clientY - rect.top
    const lensWidth = width / zoomFactor
    const lensHeight = height / zoomFactor
    let lensX = Math.max(0, Math.min(x - lensWidth / 2, width - lensWidth))
    let lensY = Math.max(0, Math.min(y - lensHeight / 2, height - lensHeight))
    const bigImageWidth = width * zoomFactor
    const bigImageHeight = height * zoomFactor
    const containerWidth = window.innerWidth > 1024 ? 320 : width
    const containerHeight =
      window.innerWidth > 1024 ? 320 : window.innerWidth > 768 ? 260 : window.innerWidth > 520 ? 220 : 180
    let offsetX = containerWidth / 2 - (lensX * zoomFactor + (lensWidth * zoomFactor) / 2)
    let offsetY = containerHeight / 2 - (lensY * zoomFactor + (lensHeight * zoomFactor) / 2)
    offsetX = Math.max(containerWidth - bigImageWidth, Math.min(0, offsetX))
    offsetY = Math.max(containerHeight - bigImageHeight, Math.min(0, offsetY))
    const zoomLeftFlag = window.innerWidth > 1024 && left + width + containerWidth > window.innerWidth
    setLens({ x: lensX, y: lensY, w: lensWidth, h: lensHeight })
    setZoomStyles({ offsetX, offsetY, zoomLeft: zoomLeftFlag })
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setLens({ x: 0, y: 0, w: 0, h: 0 })
    setZoomStyles({ offsetX: 0, offsetY: 0, zoomLeft: false })
  }

  const handlePincodeChange = (e) => {
    const value = e.target.value
    if (/^\d{0,6}$/.test(value)) setPincode(value)
    setPincodeStatus(null)
    setPincodeMessage('')
  }

  const handlePincodeApply = async () => {
    if (!pincode || pincode.length !== 6) {
      setPincodeStatus('error')
      setPincodeMessage('Please enter a valid 6-digit pincode')
      return
    }
    try {
      setIsCheckingPin(true)
      setPincodeStatus(null)
      setPincodeMessage('')
      const resp = await fetch(`${API_BASE}/api/shiprocket/pincode?pincode=${encodeURIComponent(pincode)}`)
      const data = await resp.json()
      if (!resp.ok || !data.ok) {
        setPincodeStatus('error')
        setPincodeMessage(data.message || 'Unable to check delivery for this pincode')
        return
      }
      if (data.serviceable) {
        setPincodeStatus('ok')
        setPincodeMessage(
          data.est_delivery ? `Delivery available. Estimated delivery: ${data.est_delivery}` : 'Delivery available to this pincode'
        )
      } else {
        setPincodeStatus('unserviceable')
        setPincodeMessage('Sorry, we currently do not deliver to this pincode')
      }
    } catch {
      setPincodeStatus('error')
      setPincodeMessage('Something went wrong while checking pincode')
    } finally {
      setIsCheckingPin(false)
    }
  }

  const pricing = getActivePricing()
  const discount = getDiscount()

  return (
    <div className="co-wrap">
      <Navbar />
      <div className="co-spacer" />
      <Stars />

      <div className="co-container">
        {/* ── Left: image ─────────────────────────────────── */}
        <div className="co-left">
          <div className="co-media">
            <div className="co-image-zoom" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              {product && <img src={mainImage()} alt={product.product_name} className="co-image" />}
              {isHovering && product && (
                <>
                  <div
                    className="co-lens"
                    style={{ width: `${lens.w}px`, height: `${lens.h}px`, top: `${lens.y}px`, left: `${lens.x}px` }}
                  />
                  <div
                    className="co-zoomed"
                    style={{
                      top: window.innerWidth > 1024 ? 0 : `${lens.h * zoomFactor}px`,
                      left: zoomStyles.zoomLeft
                        ? `-${window.innerWidth > 1024 ? 320 : lens.w * zoomFactor}px`
                        : `${window.innerWidth > 1024 ? lens.w * zoomFactor : 0}px`
                    }}
                  >
                    <img
                      src={mainImage()}
                      alt="Zoomed"
                      className="co-zoomed-img"
                      style={{
                        width: `${lens.w * zoomFactor * zoomFactor}px`,
                        height: `${lens.h * zoomFactor * zoomFactor}px`,
                        top: `${zoomStyles.offsetY}px`,
                        left: `${zoomStyles.offsetX}px`
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: details ──────────────────────────────── */}
        <div className="co-right">
          {isLoading ? (
            <div className="co-loader">
              <div className="spin" />
              <span>Loading options…</span>
            </div>
          ) : (
            <>
              {/* Title + trust */}
              <div className="co-top">
                <h2 className="co-name">{product?.product_name}</h2>
                <div className="co-trust">
                  <span className="co-trust-pill">Free returns</span>
                  <span className="co-trust-pill">Secure payments</span>
                </div>
              </div>

              {/* Price */}
              <div className="co-price-row">
                <span className="co-price">₹{Number(pricing.offer || pricing.mrp || 0).toFixed(2)}</span>
                {discount > 0 && <span className="co-disc">{discount}% Off</span>}
              </div>
              <div className="co-mrp">
                <span className="co-mrp-label">MRP:</span>
                <span className="co-mrp-strike">₹{Number(pricing.mrp || 0).toFixed(2)}</span>
                <span className="co-tax">Inclusive of all taxes</span>
              </div>

              {/* ── Color selector ── */}
              <div className="co-section">
                <div className="co-section-head">
                  <h3>Color</h3>
                  {selectedColor && <span className="co-chip">{selectedColor}</span>}
                </div>

                <div className="co-colors">
                  {Object.keys(colorImages).length === 0 && (
                    <span className="co-muted">No colors available</span>
                  )}
                  {Object.keys(colorImages).map((c) => (
                    <ColorSwatch
                      key={c}
                      colorName={c}
                      isActive={selectedColor === c}
                      onClick={() => handleColorClick(c)}
                    />
                  ))}
                </div>
              </div>

              {/* ── Size selector ── */}
              <div className="co-section">
                <div className="co-section-head">
                  <h3>Size</h3>
                  {selectedSize && <span className="co-chip">{selectedSize}</span>}
                </div>
                <div className="co-sizes">
                  {sizesForColor().length === 0 && <span className="co-muted">No sizes available</span>}
                  {sizesForColor().map((s) => (
                    <button
                      key={s}
                      className={`co-size${selectedSize === s ? ' selected' : ''}`}
                      onClick={() => handleSizeClick(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="co-actions">
                  <button className="btn gold ghost" onClick={() => handleAdd('wishlist')}>
                    <FaHeart style={{ marginRight: 8 }} /> Add to Wishlist
                  </button>
                  <button className="btn gold solid" onClick={() => handleAdd('bag')}>
                    <FaShoppingBag style={{ marginRight: 8 }} /> Add to Bag
                  </button>
                </div>
              </div>

              {/* ── Delivery ── */}
              <div className="co-section">
                <h3>Delivery</h3>
                <p className="co-sub">Enter your pincode to check delivery options</p>
                <div className="co-pin">
                  <input
                    type="text"
                    maxLength="6"
                    value={pincode}
                    onChange={handlePincodeChange}
                    placeholder="Enter Pincode"
                    className="enter"
                  />
                  <button className="btn black" onClick={handlePincodeApply} disabled={isCheckingPin}>
                    {isCheckingPin ? 'Checking…' : 'Apply'}
                  </button>
                </div>
                {pincodeMessage && (
                  <p className={`co-pin-msg ${pincodeStatus === 'ok' ? 'success' : pincodeStatus === 'unserviceable' ? 'warn' : 'error'}`}>
                    {pincodeMessage}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {popupMessage && <div className="co-popup">{popupMessage}</div>}
      <Footer />
    </div>
  )
}

export default CheckoutPage